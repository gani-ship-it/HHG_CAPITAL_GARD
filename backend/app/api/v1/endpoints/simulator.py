import json
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Portfolio
from app.services.simulator import SCENARIO_PRESETS, scenario_simulator

router = APIRouter()

class StressTestRequest(BaseModel):
    portfolio_id: int
    scenario_key: str = Field(default="market_crash", description="market_crash, rate_hike, inflation_spike")
    custom_shocks: Optional[Dict[str, float]] = None
    custom_vol_multiplier: Optional[float] = None

@router.get("/presets")
def get_scenario_presets():
    """Returns macroeconomic shock scenarios available for simulation"""
    return {
        "presets": SCENARIO_PRESETS
    }

@router.post("/stress-test")
def run_stress_test(req: StressTestRequest, db: Session = Depends(get_db)):
    """
    Simulates a macroeconomic shock on the current portfolio.
    Calculates shocked risk/return impact and generates a preview of the recommended rebalance.
    Does not modify active portfolio data.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == req.portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    w_current = json.loads(portfolio.current_weights_json or "{}")
    constraints = json.loads(portfolio.constraints_json or "{}")

    result = scenario_simulator.simulate_shock(
        scenario_key=req.scenario_key,
        current_weights=w_current,
        total_capital=portfolio.total_capital,
        max_risk_limit=portfolio.max_risk_limit,
        constraints=constraints,
        custom_shocks=req.custom_shocks,
        custom_vol_multiplier=req.custom_vol_multiplier
    )

    return {
        "portfolio_id": portfolio.id,
        "simulation_result": result
    }
