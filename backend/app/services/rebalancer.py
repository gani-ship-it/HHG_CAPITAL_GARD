import logging
from typing import Dict, Optional, Tuple
import numpy as np
from app.services.optimizer import portfolio_optimizer
from app.services.risk_engine import risk_engine

logger = logging.getLogger(__name__)

class RebalanceEngine:
    @staticmethod
    def calculate_turnover(w_current: Dict[str, float], w_target: Dict[str, float]) -> float:
        """
        Turnover = 0.5 * sum(|w_target_i - w_current_i|)
        """
        all_assets = set(w_current.keys()).union(set(w_target.keys()))
        abs_diff_sum = sum(abs(w_target.get(a, 0.0) - w_current.get(a, 0.0)) for a in all_assets)
        return float(round(abs_diff_sum / 2.0, 4))

    def evaluate_rebalance(
        self,
        total_capital: float,
        w_current: Dict[str, float],
        w_target: Dict[str, float],
        risk_current: float,
        risk_target: float,
        cost_per_trade_bps: float = 15.0, # 15 basis points default
        risk_aversion_factor: float = 2.0,
        partial_ratio: float = 1.0 # 1.0 = Full rebalance, 0.5 = Partial 50% step
    ) -> Dict:
        """
        Calculates trading cost vs risk reduction benefit:
        turnover = sum(|w_target - w_current|) / 2
        transaction_cost = turnover * portfolio_value * cost_per_trade_bps / 10000
        risk_reduction_value = (risk_current - risk_target) * portfolio_value * risk_aversion_factor
        
        IF risk_reduction_value > transaction_cost: REBALANCE
        ELSE: HOLD
        """
        # Apply partial rebalance ratio if requested
        if partial_ratio < 1.0:
            effective_target = {}
            for a in set(w_current.keys()).union(set(w_target.keys())):
                c = w_current.get(a, 0.0)
                t = w_target.get(a, 0.0)
                effective_target[a] = round(c + partial_ratio * (t - c), 4)
            # Re-normalize
            total = sum(effective_target.values())
            effective_target = {k: round(v / total, 4) for k, v in effective_target.items()}
            w_target_eval = effective_target
        else:
            w_target_eval = w_target

        turnover = self.calculate_turnover(w_current, w_target_eval)
        
        # Transaction costs in currency amount (e.g. INR / USD)
        transaction_cost = turnover * total_capital * (cost_per_trade_bps / 10000.0)
        
        # Financial valuation of risk reduction
        risk_delta = max(0.0, risk_current - risk_target)
        risk_reduction_value = risk_delta * total_capital * risk_aversion_factor
        
        net_benefit = risk_reduction_value - transaction_cost
        
        # The Core Decision Rule
        decision = "REBALANCE" if risk_reduction_value > transaction_cost else "HOLD"
        
        if decision == "REBALANCE":
            explanation = (
                f"Rebalance recommended: Risk reduction value ({risk_reduction_value:,.2f}) exceeds estimated "
                f"execution costs ({transaction_cost:,.2f}) across {turnover*100:.1f}% turnover."
            )
        else:
            explanation = (
                f"HOLD recommended: The breach is marginal. The estimated execution penalty ({transaction_cost:,.2f}) "
                f"outweighs the portfolio risk reduction gain ({risk_reduction_value:,.2f}). Preserving capital."
            )

        return {
            "decision": decision,
            "turnover": turnover,
            "turnover_percentage": round(turnover * 100, 2),
            "transaction_cost": round(transaction_cost, 2),
            "risk_reduction_value": round(risk_reduction_value, 2),
            "net_benefit": round(net_benefit, 2),
            "cost_per_trade_bps": cost_per_trade_bps,
            "risk_aversion_factor": risk_aversion_factor,
            "risk_current": round(risk_current, 4),
            "risk_target": round(risk_target, 4),
            "w_current": w_current,
            "w_target": w_target_eval,
            "explanation": explanation
        }

rebalance_engine = RebalanceEngine()
