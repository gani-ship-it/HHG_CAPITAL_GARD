import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Portfolio, DecisionHistory
from app.services.optimizer import portfolio_optimizer
from app.services.rebalancer import rebalance_engine

router = APIRouter()

class RebalanceEvaluationRequest(BaseModel):
    portfolio_id: int
    cost_per_trade_bps: float = Field(default=15.0, description="Trading cost assumption in basis points (1 bps = 0.01%)")
    risk_aversion_factor: float = Field(default=2.0, description="Risk aversion parameter for benefit valuation")
    partial_ratio: float = Field(default=1.0, description="1.0 for full rebalancing, 0.5 for 50% partial rebalancing")

class RebalanceExecutionRequest(BaseModel):
    portfolio_id: int
    cost_per_trade_bps: float = Field(default=15.0)
    risk_aversion_factor: float = Field(default=2.0)
    partial_ratio: float = Field(default=1.0)
    trigger: str = Field(default="VaR / Volatility limit breach")

@router.post("/evaluate")
def evaluate_rebalance(req: RebalanceEvaluationRequest, db: Session = Depends(get_db)):
    """
    Evaluates cost vs benefit of rebalancing.
    Does NOT execute trades or alter database records.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == req.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    w_current = json.loads(portfolio.current_weights_json or "{}")
    constraints = json.loads(portfolio.constraints_json or "{}")
    selected_assets = json.loads(portfolio.selected_assets_json or "[]")

    # Solve for optimal target weights
    reopt = portfolio_optimizer.optimize(
        total_capital=portfolio.total_capital,
        investment_objective=portfolio.investment_objective,
        risk_preference=portfolio.risk_preference,
        min_liquidity=portfolio.min_liquidity,
        max_risk_limit=portfolio.max_risk_limit,
        selected_assets=selected_assets,
        constraints=constraints
    )

    evaluation = rebalance_engine.evaluate_rebalance(
        total_capital=portfolio.total_capital,
        w_current=w_current,
        w_target=reopt["weights"],
        risk_current=portfolio.current_risk,
        risk_target=reopt["expected_risk"],
        cost_per_trade_bps=req.cost_per_trade_bps,
        risk_aversion_factor=req.risk_aversion_factor,
        partial_ratio=req.partial_ratio
    )

    return {
        "portfolio_id": portfolio.id,
        "evaluation": evaluation,
        "target_optimization": reopt
    }

@router.post("/execute")
def execute_rebalance(req: RebalanceExecutionRequest, db: Session = Depends(get_db)):
    """
    Executes the rebalancing decision:
    1. Updates portfolio weights & risk
    2. Resets status to SAFE
    3. Persists an immutable record to DecisionHistory for full auditability
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == req.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    w_current = json.loads(portfolio.current_weights_json or "{}")
    constraints = json.loads(portfolio.constraints_json or "{}")
    selected_assets = json.loads(portfolio.selected_assets_json or "[]")

    reopt = portfolio_optimizer.optimize(
        total_capital=portfolio.total_capital,
        investment_objective=portfolio.investment_objective,
        risk_preference=portfolio.risk_preference,
        min_liquidity=portfolio.min_liquidity,
        max_risk_limit=portfolio.max_risk_limit,
        selected_assets=selected_assets,
        constraints=constraints
    )

    evaluation = rebalance_engine.evaluate_rebalance(
        total_capital=portfolio.total_capital,
        w_current=w_current,
        w_target=reopt["weights"],
        risk_current=portfolio.current_risk,
        risk_target=reopt["expected_risk"],
        cost_per_trade_bps=req.cost_per_trade_bps,
        risk_aversion_factor=req.risk_aversion_factor,
        partial_ratio=req.partial_ratio
    )

    decision_type = evaluation["decision"]

    # Save to Decision History
    history_record = DecisionHistory(
        portfolio_id=portfolio.id,
        timestamp=datetime.utcnow(),
        trigger=req.trigger,
        w_current_json=json.dumps(w_current),
        w_target_json=json.dumps(evaluation["w_target"]),
        turnover=evaluation["turnover"],
        transaction_cost=evaluation["transaction_cost"],
        risk_reduction_value=evaluation["risk_reduction_value"],
        decision=decision_type,
        portfolio_risk_before=portfolio.current_risk,
        portfolio_risk_after=evaluation["risk_target"] if decision_type == "REBALANCE" else portfolio.current_risk,
        explanation=evaluation["explanation"]
    )
    db.add(history_record)

    # If REBALANCE approved, update the active portfolio
    if decision_type == "REBALANCE":
        portfolio.current_weights_json = json.dumps(evaluation["w_target"])
        portfolio.current_risk = evaluation["risk_target"]
        portfolio.expected_return = reopt["expected_return"]
        portfolio.health_score = reopt["health_score"]
        portfolio.status = "SAFE"
    
    db.commit()
    db.refresh(history_record)

    return {
        "status": "success",
        "action_taken": decision_type,
        "history_record": history_record.to_dict(),
        "updated_portfolio": portfolio.to_dict()
    }
