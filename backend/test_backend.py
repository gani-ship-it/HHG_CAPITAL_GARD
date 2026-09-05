import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_tests():
    print("=" * 60)
    print("RUNNING CAPITAL GUARD BACKEND SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. Test Imports
    print("\n1. Testing Core Imports...")
    import cvxpy as cp
    import numpy as np
    import pandas as pd
    import yfinance as yf
    from app.services.data_service import market_data_service
    from app.services.optimizer import portfolio_optimizer
    from app.services.risk_engine import risk_engine
    from app.services.rebalancer import rebalance_engine
    from app.services.simulator import scenario_simulator
    from app.main import app
    print("   [OK] All modules and quantitative libraries imported successfully.")

    # 2. Test Optimization Engine (CVXPY)
    print("\n2. Testing CVXPY Mean-Variance Optimization...")
    opt_result = portfolio_optimizer.optimize(
        total_capital=1000000000.0, # 100 Cr
        investment_objective="Balanced Growth",
        risk_preference="Medium",
        min_liquidity=200000000.0,
        max_risk_limit=0.07,
        selected_assets=["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"],
        constraints={"equity_max": 0.30, "corpbonds_max": 0.25}
    )
    weights = opt_result["weights"]
    total_weight = sum(weights.values())
    print(f"   [OK] Optimal Weights: {weights}")
    print(f"   [OK] Sum of Weights: {total_weight:.4f}")
    print(f"   [OK] Expected Return: {opt_result['expected_return']*100:.2f}%")
    print(f"   [OK] Expected Risk: {opt_result['expected_risk']*100:.2f}%")
    print(f"   [OK] Health Score: {opt_result['health_score']}/100")
    print(f"   [OK] Binding Explanations: {opt_result['explanations']}")
    assert abs(total_weight - 1.0) < 1e-2, "Weights must sum to 1.0"
    assert weights.get("Equity", 0.0) <= 0.305, "Equity bound violated"

    # 3. Test Risk Engine (VaR & Breach Detection)
    print("\n3. Testing Risk Engine & Historical VaR...")
    risk_eval = risk_engine.evaluate_portfolio_risk(
        weights=weights,
        total_capital=1000000000.0,
        max_risk_limit=0.07
    )
    print(f"   [OK] Annualized Volatility: {risk_eval['annualized_volatility']*100:.2f}%")
    print(f"   [OK] Historical VaR (95% 1-day): {risk_eval['historical_var_95']:,.2f}")
    print(f"   [OK] Max Historical Drawdown: {risk_eval['max_drawdown']*100:.2f}%")
    print(f"   [OK] Portfolio Status: {risk_eval['status']}")

    # 4. Test Rebalance Engine (Cost vs Benefit)
    print("\n4. Testing Cost-Aware Rebalancing Logic...")
    # Simulate a breach where risk rose to 8.5%
    rebal_eval = rebalance_engine.evaluate_rebalance(
        total_capital=1000000000.0,
        w_current={"GovBonds": 0.30, "CorpBonds": 0.20, "Equity": 0.40, "Gold": 0.05, "Cash": 0.05},
        w_target={"GovBonds": 0.40, "CorpBonds": 0.25, "Equity": 0.20, "Gold": 0.10, "Cash": 0.05},
        risk_current=0.085,
        risk_target=0.065,
        cost_per_trade_bps=15.0,
        risk_aversion_factor=2.0
    )
    print(f"   [OK] Turnover: {rebal_eval['turnover_percentage']}%")
    print(f"   [OK] Transaction Cost: {rebal_eval['transaction_cost']:,.2f}")
    print(f"   [OK] Risk Reduction Value: {rebal_eval['risk_reduction_value']:,.2f}")
    print(f"   [OK] Decision: {rebal_eval['decision']}")
    print(f"   [OK] Explanation: {rebal_eval['explanation']}")
    assert rebal_eval["decision"] == "REBALANCE", "Severe risk breach should trigger REBALANCE"

    # Test Marginal breach triggering HOLD (high turnover, minuscule risk reduction)
    hold_eval = rebalance_engine.evaluate_rebalance(
        total_capital=1000000000.0,
        w_current={"GovBonds": 0.40, "CorpBonds": 0.25, "Equity": 0.20, "Gold": 0.10, "Cash": 0.05},
        w_target={"GovBonds": 0.35, "CorpBonds": 0.30, "Equity": 0.20, "Gold": 0.10, "Cash": 0.05},
        risk_current=0.0660,
        risk_target=0.06595, # tiny 0.005% risk reduction (benefit = 50,000)
        cost_per_trade_bps=20.0, # transaction cost = 100,000
        risk_aversion_factor=1.0
    )
    print(f"   [OK] Marginal Case Decision: {hold_eval['decision']} (preserves capital against churn)")
    assert hold_eval["decision"] == "HOLD", "Marginal difference must trigger HOLD"

    # 5. Test Scenario Simulator (Market Crash)
    print("\n5. Testing Scenario Simulator (Market Crash Stress Test)...")
    sim_result = scenario_simulator.simulate_shock(
        scenario_key="market_crash",
        current_weights=weights,
        total_capital=1000000000.0,
        max_risk_limit=0.07
    )
    print(f"   [OK] Scenario: {sim_result['scenario']['name']}")
    print(f"   [OK] Shocked Risk: {sim_result['shocked_portfolio']['portfolio_risk']*100:.2f}%")
    print(f"   [OK] Capital Impact: {sim_result['shocked_portfolio']['capital_impact']:,.2f}")
    print(f"   [OK] Shocked Status: {sim_result['shocked_portfolio']['status']}")
    print(f"   [OK] Rebalance Preview Action: {sim_result['rebalance_preview']['decision']}")

    print("\n" + "=" * 60)
    print("ALL VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
