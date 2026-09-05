import json
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Portfolio
from app.services.data_service import DEFAULT_ASSETS
from app.services.optimizer import portfolio_optimizer

router = APIRouter()

class PortfolioOptimizationRequest(BaseModel):
    org_name: str = Field(default="State Reserve Bank", description="Name of the financial institution")
    org_type: str = Field(default="Bank", description="Bank, Insurance, Investment Firm, etc.")
    total_capital: float = Field(default=1000000000.0, description="Total capital (e.g. 100 Cr = 1,000,000,000)")
    currency: str = Field(default="INR", description="Currency symbol/code")
    investment_horizon_years: int = Field(default=3, description="Horizon in years")
    investment_objective: str = Field(default="Balanced Growth", description="Growth, Balanced Growth, Income, Capital Preservation")
    risk_preference: str = Field(default="Medium", description="Low, Medium, High")
    min_liquidity: float = Field(default=200000000.0, description="Minimum liquid reserves (e.g. 20 Cr)")
    max_risk_limit: float = Field(default=0.07, description="Maximum allowed annualized portfolio risk")
    selected_assets: List[str] = Field(default=["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"])
    constraints: Dict[str, float] = Field(
        default={"equity_max": 0.30, "corpbonds_max": 0.25},
        description="Asset bounds, e.g. equity_max, corpbonds_max"
    )

@router.get("/defaults")
def get_defaults():
    """Returns platform default options and assets"""
    return {
        "assets": DEFAULT_ASSETS,
        "objectives": ["Growth", "Balanced Growth", "Income", "Capital Preservation"],
        "risk_levels": ["Low", "Medium", "High"],
        "example_scenario": {
            "org_name": "Apex National Bank",
            "org_type": "Bank",
            "total_capital": 1000000000.0,
            "currency": "INR",
            "min_liquidity": 200000000.0,
            "max_risk_limit": 0.07,
            "constraints": {"equity_max": 0.30, "corpbonds_max": 0.25}
        }
    }

@router.post("/optimize")
def optimize_portfolio(req: PortfolioOptimizationRequest, db: Session = Depends(get_db)):
    """
    Runs CVXPY Mean-Variance Optimization, calculates portfolio health score,
    identifies binding constraints, and saves to database.
    """
    try:
        opt_result = portfolio_optimizer.optimize(
            total_capital=req.total_capital,
            investment_objective=req.investment_objective,
            risk_preference=req.risk_preference,
            min_liquidity=req.min_liquidity,
            max_risk_limit=req.max_risk_limit,
            selected_assets=req.selected_assets,
            constraints=req.constraints
        )

        portfolio = Portfolio(
            org_name=req.org_name,
            org_type=req.org_type,
            total_capital=req.total_capital,
            currency=req.currency,
            investment_horizon_years=req.investment_horizon_years,
            investment_objective=req.investment_objective,
            risk_preference=req.risk_preference,
            min_liquidity=req.min_liquidity,
            max_risk_limit=req.max_risk_limit,
            selected_assets_json=json.dumps(req.selected_assets),
            constraints_json=json.dumps(req.constraints),
            current_weights_json=json.dumps(opt_result["weights"]),
            expected_return=opt_result["expected_return"],
            current_risk=opt_result["expected_risk"],
            current_liquidity=opt_result["current_liquidity"],
            health_score=opt_result["health_score"],
            status=opt_result["status"]
        )

        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        return {
            "portfolio": portfolio.to_dict(),
            "optimization": opt_result
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@router.get("/{portfolio_id}")
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Retrieves an existing portfolio record"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio.to_dict()
