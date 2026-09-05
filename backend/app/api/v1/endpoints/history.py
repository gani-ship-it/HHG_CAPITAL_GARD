from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import DecisionHistory, Portfolio

router = APIRouter()

@router.get("/{portfolio_id}")
def get_decision_history(portfolio_id: int, db: Session = Depends(get_db)):
    """
    Returns the append-only audit log of decisions (REBALANCE / HOLD)
    for regulatory auditability and compliance.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    records = (
        db.query(DecisionHistory)
        .filter(DecisionHistory.portfolio_id == portfolio_id)
        .order_by(DecisionHistory.timestamp.desc())
        .all()
    )

    return {
        "portfolio_id": portfolio_id,
        "total_records": len(records),
        "history": [r.to_dict() for r in records]
    }
