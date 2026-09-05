import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Standard institutional asset mapping
DEFAULT_ASSETS = {
    "GovBonds": {"name": "Government Bonds", "ticker": "GOVT", "liquid": True, "category": "Fixed Income"},
    "CorpBonds": {"name": "Corporate Bonds", "ticker": "LQD", "liquid": False, "category": "Fixed Income"},
    "Equity": {"name": "Equity (Index)", "ticker": "SPY", "liquid": False, "category": "Equity"},
    "Gold": {"name": "Gold", "ticker": "GLD", "liquid": False, "category": "Commodities"},
    "Cash": {"name": "Cash & Liquid Reserves", "ticker": "BIL", "liquid": True, "category": "Cash Equivalent"}
}

# Synthetic fallback data generator if network/yfinance is completely offline during demo
def generate_synthetic_historical_data(ticker: str, days: int = 252) -> pd.Series:
    np.random.seed(abs(hash(ticker)) % (2**32))
    # Characteristic drift and vol per asset type
    params = {
        "GOVT": {"mean": 0.04 / 252, "vol": 0.06 / np.sqrt(252), "base": 24.0},
        "LQD": {"mean": 0.06 / 252, "vol": 0.09 / np.sqrt(252), "base": 110.0},
        "SPY": {"mean": 0.12 / 252, "vol": 0.16 / np.sqrt(252), "base": 500.0},
        "GLD": {"mean": 0.08 / 252, "vol": 0.14 / np.sqrt(252), "base": 190.0},
        "BIL": {"mean": 0.045 / 252, "vol": 0.005 / np.sqrt(252), "base": 91.5}
    }
    p = params.get(ticker, {"mean": 0.07 / 252, "vol": 0.12 / np.sqrt(252), "base": 100.0})
    daily_returns = np.random.normal(p["mean"], p["vol"], days)
    price_paths = p["base"] * np.cumprod(1 + daily_returns)
    dates = pd.date_range(end=datetime.today(), periods=days, freq="B")
    return pd.Series(price_paths, index=dates, name=ticker)

class MarketDataService:
    def __init__(self, cache_dir: str = CACHE_DIR):
        self.cache_dir = cache_dir

    def _get_cache_path(self, ticker: str) -> str:
        return os.path.join(self.cache_dir, f"{ticker}_history.json")

    def fetch_asset_history(self, ticker: str, period: str = "1y") -> pd.Series:
        cache_path = self._get_cache_path(ticker)
        
        # Check cache validity (less than 24 hours old)
        if os.path.exists(cache_path):
            try:
                mod_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
                if datetime.now() - mod_time < timedelta(hours=24):
                    with open(cache_path, "r") as f:
                        cached_data = json.load(f)
                    dates = pd.to_datetime(list(cached_data.keys()))
                    values = list(cached_data.values())
                    logger.info(f"Loaded {ticker} from local cache.")
                    return pd.Series(values, index=dates, name=ticker).sort_index()
            except Exception as e:
                logger.warning(f"Failed to read cache for {ticker}: {e}")

        # Attempt yfinance download
        try:
            logger.info(f"Fetching {ticker} from yfinance...")
            stock = yf.Ticker(ticker)
            df = stock.history(period=period, timeout=10)
            if df.empty or "Close" not in df:
                raise ValueError(f"No price data returned for {ticker}")
            
            prices = df["Close"].dropna()
            # Save to cache
            cache_payload = {d.strftime("%Y-%m-%d"): float(v) for d, v in prices.items()}
            with open(cache_path, "w") as f:
                json.dump(cache_payload, f)
            return prices
        except Exception as e:
            logger.warning(f"yfinance fetch failed for {ticker}: {e}. Generating offline synthetic series.")
            series = generate_synthetic_historical_data(ticker)
            cache_payload = {d.strftime("%Y-%m-%d"): float(v) for d, v in series.items()}
            with open(cache_path, "w") as f:
                json.dump(cache_payload, f)
            return series

    def get_portfolio_market_data(self, asset_keys: List[str] = None) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Returns (prices_df, returns_df) for selected institutional asset keys
        """
        if not asset_keys:
            asset_keys = list(DEFAULT_ASSETS.keys())

        price_dict = {}
        for key in asset_keys:
            info = DEFAULT_ASSETS.get(key, {"ticker": key})
            ticker = info.get("ticker", key)
            series = self.fetch_asset_history(ticker)
            price_dict[key] = series

        prices_df = pd.DataFrame(price_dict).dropna()
        returns_df = prices_df.pct_change().dropna()
        return prices_df, returns_df

    def compute_statistics(self, returns_df: pd.DataFrame, use_shrinkage: bool = True) -> Dict:
        """
        Computes annual expected returns, annualized rolling covariance matrix, and individual volatilities.
        """
        # Annualized expected return (252 trading days)
        exp_returns = returns_df.mean() * 252

        # Covariance matrix (annualized)
        sample_cov = returns_df.cov() * 252

        if use_shrinkage and len(returns_df) > 10:
            # Ledoit-Wolf shrinkage to diagonal for numerical stability
            n = sample_cov.shape[0]
            prior = np.diag(np.diag(sample_cov))
            shrinkage_factor = 0.15
            cov_matrix = (1 - shrinkage_factor) * sample_cov.values + shrinkage_factor * prior
            cov_df = pd.DataFrame(cov_matrix, index=returns_df.columns, columns=returns_df.columns)
        else:
            cov_df = sample_cov

        volatilities = np.sqrt(np.diag(cov_df.values))
        vol_series = pd.Series(volatilities, index=returns_df.columns)

        return {
            "expected_returns": exp_returns.to_dict(),
            "volatilities": vol_series.to_dict(),
            "covariance_matrix": cov_df.to_dict()
        }

    def fetch_fred_macro_indicators(self) -> Dict:
        """
        Fetches official macroeconomic indicators directly from Federal Reserve Economic Data (FRED).
        """
        from app.core.config import settings
        api_key = settings.FRED_API_KEY or os.getenv("FRED_API_KEY", "").strip()
        if not api_key:
            return {"status": "unconfigured"}
        
        import httpx
        indicators = {}
        series_map = {
            "us_10y_treasury": "DGS10",
            "fed_funds_rate": "FEDFUNDS",
            "us_3m_tbill": "DTB3"
        }
        for label, sid in series_map.items():
            try:
                url = f"https://api.stlouisfed.org/fred/series/observations?series_id={sid}&api_key={api_key}&file_type=json&sort_order=desc&limit=1"
                r = httpx.get(url, timeout=5)
                if r.status_code == 200:
                    obs = r.json().get("observations", [])
                    if obs and obs[0]["value"] != ".":
                        indicators[label] = {
                            "rate": float(obs[0]["value"]),
                            "date": obs[0]["date"],
                            "source": "Federal Reserve (FRED)"
                        }
            except Exception as e:
                logger.warning(f"FRED fetch error for {sid}: {e}")
        return indicators

market_data_service = MarketDataService()
