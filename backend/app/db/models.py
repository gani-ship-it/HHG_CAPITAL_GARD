import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    org_name = Column(String(255), default="Institutional Client")
    org_type = Column(String(100), default="Bank") # Bank, Insurance, Treasury, etc.
    total_capital = Column(Float, nullable=False, default=1000000000.0) # e.g. 100 Cr = 1,000,000,000
    currency = Column(String(10), default="INR")
    investment_horizon_years = Column(Integer, default=3)
    investment_objective = Column(String(50), default="Growth") # Growth, Income, Capital Preservation
    risk_preference = Column(String(50), default="Medium") # Low, Medium, High
    min_liquidity = Column(Float, default=200000000.0) # e.g. 20 Cr
    max_risk_limit = Column(Float, default=0.07) # e.g. 7% annualized risk limit
    
    # JSON encoded fields
    selected_assets_json = Column(Text, default="[]") # List of symbols/names
    constraints_json = Column(Text, default="{}") # e.g. {"equity_max": 0.30, "corp_bond_max": 0.25}
    current_weights_json = Column(Text, default="{}") # e.g. {"Equity": 0.20, "GovBonds": 0.40...}
    
    # Portfolio statistics
    expected_return = Column(Float, default=0.0)
    current_risk = Column(Float, default=0.0)
    current_liquidity = Column(Float, default=0.0)
    health_score = Column(Float, default=100.0)
    status = Column(String(20), default="SAFE") # SAFE (🟢) or ALERT (🔴)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    decisions = relationship("DecisionHistory", back_populates="portfolio", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "org_name": self.org_name,
            "org_type": self.org_type,
            "total_capital": self.total_capital,
            "currency": self.currency,
            "investment_horizon_years": self.investment_horizon_years,
            "investment_objective": self.investment_objective,
            "risk_preference": self.risk_preference,
            "min_liquidity": self.min_liquidity,
            "max_risk_limit": self.max_risk_limit,
            "selected_assets": json.loads(self.selected_assets_json or "[]"),
            "constraints": json.loads(self.constraints_json or "{}"),
            "current_weights": json.loads(self.current_weights_json or "{}"),
            "expected_return": self.expected_return,
            "current_risk": self.current_risk,
            "current_liquidity": self.current_liquidity,
            "health_score": self.health_score,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class DecisionHistory(Base):
    __tablename__ = "decision_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    trigger = Column(String(100), default="VaR breach") # "VaR breach", "Volatility spike", "Manual"
    
    w_current_json = Column(Text, nullable=False) # JSON weights before
    w_target_json = Column(Text, nullable=False) # JSON target weights
    
    turnover = Column(Float, default=0.0)
    transaction_cost = Column(Float, default=0.0)
    risk_reduction_value = Column(Float, default=0.0)
    decision = Column(String(20), nullable=False) # "REBALANCE" or "HOLD"
    
    portfolio_risk_before = Column(Float, default=0.0)
    portfolio_risk_after = Column(Float, default=0.0)
    explanation = Column(Text, default="")
    
    portfolio = relationship("Portfolio", back_populates="decisions")

    def to_dict(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "trigger": self.trigger,
            "w_current": json.loads(self.w_current_json or "{}"),
            "w_target": json.loads(self.w_target_json or "{}"),
            "turnover": self.turnover,
            "transaction_cost": self.transaction_cost,
            "risk_reduction_value": self.risk_reduction_value,
            "decision": self.decision,
            "portfolio_risk_before": self.portfolio_risk_before,
            "portfolio_risk_after": self.portfolio_risk_after,
            "explanation": self.explanation
        }


class MarketCache(Base):
    __tablename__ = "market_cache"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    symbol = Column(String(50), unique=True, index=True, nullable=False)
    data_json = Column(Text, nullable=False) # Serialized price time-series & metrics
    last_updated = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=True)
    role = Column(String(20), nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    model = Column(String(50), default="groq/llama-3.3-70b-versatile")

    def to_dict(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "model": self.model
        }

