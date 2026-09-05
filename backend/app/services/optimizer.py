import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import cvxpy as cp
from app.services.data_service import DEFAULT_ASSETS, market_data_service

logger = logging.getLogger(__name__)

# Risk aversion factors (lambda) based on investment objectives
OBJECTIVE_LAMBDAS = {
    "Growth": 1.0,
    "Balanced Growth": 1.8,
    "Income": 3.0,
    "Capital Preservation": 5.5
}

class PortfolioOptimizer:
    @staticmethod
    def calculate_health_score(
        weights: Dict[str, float],
        portfolio_risk: float,
        max_risk: float,
        current_liquidity: float,
        min_liquidity: float,
        constraints_satisfied: bool = True
    ) -> float:
        """
        Calculates institutional Portfolio Health Score (0 - 100)
        Health = 40 * (1 - risk / max_risk)
               + 25 * min(liquidity / min_liquidity, 1)
               + 20 * (1 - HHI)
               + 15 * constraint_compliance
        """
        w_values = np.array(list(weights.values()))
        # Concentration metric: Herfindahl-Hirschman Index
        hhi = float(np.sum(w_values ** 2))
        
        # Risk component (max 40)
        risk_ratio = portfolio_risk / max_risk if max_risk > 0 else 1.0
        risk_score = 40.0 * max(0.0, min(1.0, (1.0 - (risk_ratio - 1.0) if risk_ratio > 1.0 else 1.0 - (risk_ratio * 0.5))))
        
        # Liquidity component (max 25)
        liq_ratio = current_liquidity / min_liquidity if min_liquidity > 0 else 1.0
        liq_score = 25.0 * min(1.0, liq_ratio)
        
        # Diversification component (max 20)
        div_score = 20.0 * max(0.0, min(1.0, (1.0 - hhi)))
        
        # Compliance component (max 15)
        comp_score = 15.0 if constraints_satisfied else 5.0
        
        total_health = risk_score + liq_score + div_score + comp_score
        return round(float(np.clip(total_health, 0.0, 100.0)), 1)

    @staticmethod
    def generate_binding_explanations(
        weights: Dict[str, float],
        constraints: Dict[str, float],
        min_liquidity_ratio: float,
        liquid_assets: List[str]
    ) -> List[str]:
        """
        Deterministically explains optimization decisions based on active binding constraints.
        """
        explanations = []
        tol = 0.005 # 0.5% tolerance for boundary detection
        
        for asset, w in weights.items():
            max_bound_key = f"{asset.lower()}_max"
            min_bound_key = f"{asset.lower()}_min"
            
            if max_bound_key in constraints:
                bound = constraints[max_bound_key]
                if abs(w - bound) <= tol:
                    explanations.append(
                        f"{asset} reached its upper limit of {bound*100:.1f}%. Capital was diverted to safer alternatives to respect risk guidelines."
                    )
            elif min_bound_key in constraints:
                bound = constraints[min_bound_key]
                if abs(w - bound) <= tol:
                    explanations.append(
                        f"{asset} held at required floor of {bound*100:.1f}%."
                    )

        # Check total liquid allocation
        total_liquid_weight = sum(weights.get(a, 0.0) for a in liquid_assets)
        if abs(total_liquid_weight - min_liquidity_ratio) <= 0.015:
            explanations.append(
                f"Liquidity requirement ({min_liquidity_ratio*100:.1f}%) was an active binding constraint, reserving defensive capital in cash & treasuries."
            )

        if not explanations:
            explanations.append(
                "Optimal unconstrained risk-adjusted balance achieved across selected asset classes based on historical covariance."
            )

        return explanations

    def optimize(
        self,
        total_capital: float,
        investment_objective: str = "Growth",
        risk_preference: str = "Medium",
        min_liquidity: float = 200000000.0,
        max_risk_limit: float = 0.08,
        selected_assets: Optional[List[str]] = None,
        constraints: Optional[Dict[str, float]] = None
    ) -> Dict:
        """
        Solves Mean-Variance Optimization using CVXPY
        """
        if not selected_assets:
            selected_assets = list(DEFAULT_ASSETS.keys())
        if constraints is None:
            constraints = {
                "equity_max": 0.30,
                "corpbonds_max": 0.25
            }

        prices_df, returns_df = market_data_service.get_portfolio_market_data(selected_assets)
        stats = market_data_service.compute_statistics(returns_df)
        
        asset_names = list(selected_assets)
        n = len(asset_names)
        
        # Expected returns vector and Covariance matrix
        mu = np.array([stats["expected_returns"][a] for a in asset_names])
        Sigma = pd.DataFrame(stats["covariance_matrix"]).loc[asset_names, asset_names].values
        
        # Ensure Positive Semi-Definite matrix
        Sigma = (Sigma + Sigma.T) / 2
        min_eig = np.min(np.real(np.linalg.eigvals(Sigma)))
        if min_eig < 1e-6:
            Sigma += np.eye(n) * (1e-6 - min_eig)

        # CVXPY Variables
        w = cp.Variable(n)
        
        # Risk penalty lambda
        lam = OBJECTIVE_LAMBDAS.get(investment_objective, 1.8)
        if risk_preference == "Low":
            lam *= 1.5
        elif risk_preference == "High":
            lam *= 0.7

        # Objective: Maximize return - lambda * variance
        # cvxpy minimize: lambda * quad_form - mu^T * w
        risk_term = cp.quad_form(w, Sigma)
        objective = cp.Minimize(lam * risk_term - mu @ w)

        # Basic constraints: sum(w) == 1, w >= 0
        problem_constraints = [
            cp.sum(w) == 1.0,
            w >= 0.0
        ]

        # Asset specific upper/lower bounds
        for i, asset in enumerate(asset_names):
            max_key = f"{asset.lower()}_max"
            min_key = f"{asset.lower()}_min"
            if max_key in constraints:
                problem_constraints.append(w[i] <= float(constraints[max_key]))
            if min_key in constraints:
                problem_constraints.append(w[i] >= float(constraints[min_key]))

        # Liquidity constraint: sum of liquid asset weights >= min_liquidity / total_capital
        min_liq_ratio = min(1.0, max(0.0, min_liquidity / total_capital)) if total_capital > 0 else 0.20
        liquid_indices = [i for i, a in enumerate(asset_names) if DEFAULT_ASSETS.get(a, {}).get("liquid", False)]
        if liquid_indices:
            problem_constraints.append(cp.sum([w[i] for i in liquid_indices]) >= min_liq_ratio)

        # Risk limit constraint: sqrt(w^T Sigma w) <= max_risk_limit
        # In quadratic form: w^T Sigma w <= max_risk_limit^2
        if max_risk_limit and max_risk_limit > 0:
            problem_constraints.append(risk_term <= (max_risk_limit ** 2))

        # Solve QP
        prob = cp.Problem(objective, problem_constraints)
        try:
            prob.solve(solver=cp.CLARABEL, verbose=False)
            if prob.status not in ["optimal", "optimal_inaccurate"]:
                logger.warning(f"CLARABEL status {prob.status}. Retrying with OSQP...")
                prob.solve(solver=cp.OSQP, verbose=False)
        except Exception as e:
            logger.warning(f"Optimization solver exception: {e}. Solving with standard ECOS/SCS...")
            prob.solve(solver=cp.SCS, verbose=False)

        # Extract weights or fallback to heuristic equal/safe weights if infeasible
        if w.value is None or prob.status not in ["optimal", "optimal_inaccurate"]:
            logger.warning("Optimization failed to find optimal weights. Applying defensive allocation.")
            weights_dict = {a: (0.40 if a == "GovBonds" else 0.25 if a == "CorpBonds" else 0.20 if a == "Equity" else 0.10 if a == "Gold" else 0.05) for a in asset_names}
            total = sum(weights_dict.values())
            weights_dict = {k: v / total for k, v in weights_dict.items()}
        else:
            raw_weights = np.maximum(0.0, np.array(w.value))
            raw_weights = raw_weights / np.sum(raw_weights)
            weights_dict = {asset_names[i]: float(round(raw_weights[i], 4)) for i in range(n)}

        # Compute resulting metrics
        weights_arr = np.array([weights_dict[a] for a in asset_names])
        portfolio_return = float(np.dot(weights_arr, mu))
        portfolio_variance = float(weights_arr.T @ Sigma @ weights_arr)
        portfolio_risk = float(np.sqrt(max(0.0, portfolio_variance)))
        
        liquid_assets = [a for a in asset_names if DEFAULT_ASSETS.get(a, {}).get("liquid", False)]
        liquid_ratio = sum(weights_dict.get(a, 0.0) for a in liquid_assets)
        current_liquidity = liquid_ratio * total_capital

        # Health score
        health = self.calculate_health_score(
            weights=weights_dict,
            portfolio_risk=portfolio_risk,
            max_risk=max_risk_limit,
            current_liquidity=current_liquidity,
            min_liquidity=min_liquidity,
            constraints_satisfied=(prob.status in ["optimal", "optimal_inaccurate"])
        )

        # Binding constraint explanations
        explanations = self.generate_binding_explanations(
            weights=weights_dict,
            constraints=constraints,
            min_liquidity_ratio=min_liq_ratio,
            liquid_assets=liquid_assets
        )

        return {
            "weights": weights_dict,
            "expected_return": round(portfolio_return, 4),
            "expected_risk": round(portfolio_risk, 4),
            "current_liquidity": round(current_liquidity, 2),
            "liquidity_ratio": round(liquid_ratio, 4),
            "health_score": health,
            "status": "SAFE" if portfolio_risk <= max_risk_limit else "ALERT",
            "solver_status": prob.status,
            "explanations": explanations,
            "individual_asset_stats": {
                a: {
                    "expected_return": round(stats["expected_returns"][a], 4),
                    "volatility": round(stats["volatilities"][a], 4)
                } for a in asset_names
            }
        }

portfolio_optimizer = PortfolioOptimizer()
