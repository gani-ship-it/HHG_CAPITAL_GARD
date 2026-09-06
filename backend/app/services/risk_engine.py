import logging
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from app.services.data_service import DEFAULT_ASSETS, market_data_service

logger = logging.getLogger(__name__)

class RiskEngine:
    @staticmethod
    def calculate_historical_var(
        portfolio_returns: pd.Series,
        portfolio_value: float,
        confidence_level: float = 0.95
    ) -> float:
        """
        Computes non-parametric Historical Value at Risk (VaR):
        VaR_95 = -percentile(daily_returns, (1 - confidence_level) * 100) * portfolio_value
        """
        if len(portfolio_returns) < 10:
            return 0.0
        percentile_alpha = (1.0 - confidence_level) * 100.0
        worst_return = float(np.percentile(portfolio_returns, percentile_alpha))
        var_amount = -worst_return * portfolio_value
        return max(0.0, float(round(var_amount, 2)))

    @staticmethod
    def calculate_max_drawdown(portfolio_returns: pd.Series) -> float:
        """
        Computes the peak-to-trough maximum drawdown over the returns series.
        """
        if len(portfolio_returns) < 2:
            return 0.0
        cumulative_wealth = (1 + portfolio_returns).cumprod()
        running_max = cumulative_wealth.cummax()
        drawdown = (cumulative_wealth - running_max) / running_max
        max_dd = float(drawdown.min()) # Negative number, e.g. -0.08
        return round(abs(max_dd), 4)

    def evaluate_portfolio_risk(
        self,
        weights: Dict[str, float],
        total_capital: float,
        max_risk_limit: float = 0.07,
        max_drawdown_limit: float = 0.10
    ) -> Dict:
        """
        Evaluates portfolio against historical market data to calculate:
        - Annualized Volatility
        - Historical VaR (95% 1-day)
        - Maximum Historical Drawdown
        - Breach status & reason
        """
        asset_keys = list(weights.keys())
        prices_df, returns_df = market_data_service.get_portfolio_market_data(asset_keys)
        
        # Calculate daily portfolio returns series
        w_series = pd.Series(weights)
        daily_portfolio_returns = returns_df[asset_keys].dot(w_series)

        # Annualized volatility
        ann_volatility = float(daily_portfolio_returns.std() * np.sqrt(252))
        
        # Historical VaR (95%)
        var_95 = self.calculate_historical_var(daily_portfolio_returns, total_capital, confidence_level=0.95)
        
        # Max Drawdown
        max_dd = self.calculate_max_drawdown(daily_portfolio_returns)

        # Liquidity analysis
        liquid_assets = [a for a in asset_keys if DEFAULT_ASSETS.get(a, {}).get("liquid", False)]
        liquid_ratio = sum(weights.get(a, 0.0) for a in liquid_assets)
        current_liquidity = liquid_ratio * total_capital

        # Risk breach checks (with 5 bps numerical margin to prevent floating-point false breaches)
        is_risk_breached = (ann_volatility - max_risk_limit) > 0.0005
        is_drawdown_breached = (max_dd - max_drawdown_limit) > 0.0005
        is_breach = is_risk_breached or is_drawdown_breached

        breach_reasons = []
        if is_risk_breached:
            breach_reasons.append(
                f"Portfolio Volatility ({ann_volatility*100:.1f}%) exceeds policy threshold of {max_risk_limit*100:.1f}%."
            )
        if is_drawdown_breached:
            breach_reasons.append(
                f"Maximum Historical Drawdown ({max_dd*100:.1f}%) exceeds allowed limit of {max_drawdown_limit*100:.1f}%."
            )

        return {
            "annualized_volatility": round(ann_volatility, 4),
            "max_risk_limit": max_risk_limit,
            "historical_var_95": var_95,
            "max_drawdown": max_dd,
            "current_liquidity": round(current_liquidity, 2),
            "liquid_ratio": round(liquid_ratio, 4),
            "is_breach": is_breach,
            "status": "ALERT" if is_breach else "SAFE",
            "breach_reasons": breach_reasons
        }

risk_engine = RiskEngine()
