import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Portfolio
from app.services.risk_engine import risk_engine

router = APIRouter()

@router.get("/macro-indicators")
def get_macro_indicators():
    """
    Fetches official macroeconomic indicators directly from Federal Reserve Economic Data (FRED).
    """
    from app.services.data_service import market_data_service
    return market_data_service.fetch_fred_macro_indicators()

class SimulateMarketChangeRequest(BaseModel):
    simulated_risk: float = Field(default=0.081, description="Simulate market risk rising (e.g. 8.1%)")
    simulated_drawdown: float = Field(default=0.065, description="Simulate market drawdown")

@router.get("/{portfolio_id}/metrics")
def get_monitoring_metrics(portfolio_id: int, db: Session = Depends(get_db)):
    """
    Computes continuous monitoring metrics:
    - Historical VaR (95%)
    - Annualized Volatility
    - Peak-to-Trough Drawdown
    - Risk Breach Status (🟢 SAFE vs 🔴 ALERT)
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    weights = json.loads(portfolio.current_weights_json or "{}")
    metrics = risk_engine.evaluate_portfolio_risk(
        weights=weights,
        total_capital=portfolio.total_capital,
        max_risk_limit=portfolio.max_risk_limit
    )

    # Sync status to DB
    if portfolio.status != metrics["status"]:
        portfolio.status = metrics["status"]
        db.commit()

    return {
        "portfolio_id": portfolio.id,
        "org_name": portfolio.org_name,
        "total_capital": portfolio.total_capital,
        "metrics": metrics
    }

@router.post("/{portfolio_id}/simulate-market-change")
def simulate_market_change(
    portfolio_id: int,
    req: SimulateMarketChangeRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates a live market shock for hackathon demo purposes
    (e.g. Step 5 in demo scenario: Portfolio risk rises 6.2% -> 8.1% -> triggers 🔴 ALERT)
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    portfolio.current_risk = req.simulated_risk
    is_breached = req.simulated_risk > portfolio.max_risk_limit
    portfolio.status = "ALERT" if is_breached else "SAFE"
    db.commit()

    weights = json.loads(portfolio.current_weights_json or "{}")
    metrics = risk_engine.evaluate_portfolio_risk(
        weights=weights,
        total_capital=portfolio.total_capital,
        max_risk_limit=portfolio.max_risk_limit
    )
    metrics["current_risk"] = req.simulated_risk
    metrics["status"] = "BREACH" if is_breached else "SAFE"

    return {
        "portfolio_id": portfolio.id,
        "simulated_risk": req.simulated_risk,
        "max_risk_limit": portfolio.max_risk_limit,
        "status": portfolio.status,
        "is_breached": is_breached,
        "metrics": metrics,
        "alert_message": f"🔴 Risk Breach Detected: Allowed Risk {portfolio.max_risk_limit*100:.1f}% vs Actual {req.simulated_risk*100:.1f}%" if is_breached else "🟢 SAFE"
    }
