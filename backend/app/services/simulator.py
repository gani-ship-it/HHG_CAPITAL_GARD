import logging
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from app.services.data_service import market_data_service
from app.services.optimizer import portfolio_optimizer
from app.services.rebalancer import rebalance_engine

logger = logging.getLogger(__name__)

SCENARIO_PRESETS = {
    "market_crash": {
        "name": "Market Crash",
        "description": "Equities plunge -30%, flight to safety elevates Gold (+10%) & Gov Bonds (+5%), market volatility spikes by 50%.",
        "return_shocks": {"Equity": -0.30, "GovBonds": 0.05, "Gold": 0.10, "CorpBonds": -0.05, "Cash": 0.0},
        "volatility_multiplier": 1.5
    },
    "rate_hike": {
        "name": "Aggressive Rate Hike",
        "description": "Central bank hikes interest rates: fixed income drops (Bonds -8%), Cash yield rises (+1%), Equities decline (-5%).",
        "return_shocks": {"GovBonds": -0.08, "CorpBonds": -0.10, "Cash": 0.01, "Equity": -0.05, "Gold": -0.04},
        "volatility_multiplier": 1.2
    },
    "inflation_spike": {
        "name": "Stagflation / Inflation Spike",
        "description": "Inflation escalates: Gold surges (+15%), purchasing power hurts long-duration Bonds (-6%), Equity contracts (-3%).",
        "return_shocks": {"Gold": 0.15, "GovBonds": -0.06, "CorpBonds": -0.04, "Equity": -0.03, "Cash": 0.0},
        "volatility_multiplier": 1.3
    }
}

class ScenarioSimulator:
    def simulate_shock(
        self,
        scenario_key: str,
        current_weights: Dict[str, float],
        total_capital: float,
        max_risk_limit: float = 0.07,
        constraints: Optional[Dict[str, float]] = None,
        custom_shocks: Optional[Dict[str, float]] = None,
        custom_vol_multiplier: Optional[float] = None
    ) -> Dict:
        """
        Applies a macroeconomic shock, calculates shocked metrics,
        and generates a rebalancing preview.
        """
        asset_names = list(current_weights.keys())
        prices_df, returns_df = market_data_service.get_portfolio_market_data(asset_names)
        stats = market_data_service.compute_statistics(returns_df)

        preset = SCENARIO_PRESETS.get(scenario_key, SCENARIO_PRESETS["market_crash"])
        shocks = custom_shocks if custom_shocks else preset["return_shocks"]
        vol_multiplier = custom_vol_multiplier if custom_vol_multiplier else preset["volatility_multiplier"]

        # Base parameters
        mu_base = np.array([stats["expected_returns"].get(a, 0.06) for a in asset_names])
        Sigma_base = pd.DataFrame(stats["covariance_matrix"]).loc[asset_names, asset_names].values
        w_curr = np.array([current_weights.get(a, 0.0) for a in asset_names])

        # Current pre-shock metrics
        base_return = float(np.dot(w_curr, mu_base))
        base_risk = float(np.sqrt(max(0.0, w_curr.T @ Sigma_base @ w_curr)))

        # Apply Shocks
        shock_vector = np.array([shocks.get(a, 0.0) for a in asset_names])
        mu_shocked = mu_base + shock_vector
        Sigma_shocked = Sigma_base * (vol_multiplier ** 2)

        # Recompute shocked portfolio return & risk
        shocked_return = float(np.dot(w_curr, mu_shocked))
        shocked_variance = float(w_curr.T @ Sigma_shocked @ w_curr)
        shocked_risk = float(np.sqrt(max(0.0, shocked_variance)))

        # Immediate portfolio impact in currency
        portfolio_value_impact = float(np.dot(w_curr, shock_vector) * total_capital)
        projected_capital = total_capital + portfolio_value_impact

        # Check for breach under shock
        is_breach = shocked_risk > max_risk_limit

        # Run defensive re-optimization to find optimal shocked target allocation
        reopt_result = portfolio_optimizer.optimize(
            total_capital=projected_capital,
            investment_objective="Capital Preservation" if is_breach else "Balanced Growth",
            risk_preference="Low" if is_breach else "Medium",
            min_liquidity=total_capital * 0.20,
            max_risk_limit=max_risk_limit,
            selected_assets=asset_names,
            constraints=constraints
        )

        w_target = reopt_result["weights"]
        risk_target = reopt_result["expected_risk"]

        # Evaluate rebalancing preview
        rebal_eval = rebalance_engine.evaluate_rebalance(
            total_capital=projected_capital,
            w_current=current_weights,
            w_target=w_target,
            risk_current=shocked_risk,
            risk_target=risk_target,
            cost_per_trade_bps=15.0,
            risk_aversion_factor=2.0
        )

        return {
            "scenario": {
                "key": scenario_key,
                "name": preset["name"],
                "description": preset["description"],
                "shocks": shocks,
                "volatility_multiplier": vol_multiplier
            },
            "pre_shock": {
                "expected_return": round(base_return, 4),
                "portfolio_risk": round(base_risk, 4),
                "total_capital": total_capital
            },
            "shocked_portfolio": {
                "expected_return": round(shocked_return, 4),
                "portfolio_risk": round(shocked_risk, 4),
                "risk_increase_percentage": round(((shocked_risk - base_risk) / max(0.001, base_risk)) * 100, 2),
                "capital_impact": round(portfolio_value_impact, 2),
                "projected_capital": round(projected_capital, 2),
                "is_breach": is_breach,
                "status": "ALERT" if is_breach else "SAFE"
            },
            "rebalance_preview": rebal_eval
        }

scenario_simulator = ScenarioSimulator()
