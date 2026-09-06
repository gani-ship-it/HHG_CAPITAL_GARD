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
    
    user_email = Column(String(255), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    decisions = relationship("DecisionHistory", back_populates="portfolio", cascade="all, delete-orphan")

    def to_dict(self):
        weights = json.loads(self.current_weights_json or "{}")
        risk = self.current_risk or 0.0
        # Derive synthetic metrics for frontend display
        var_95 = round(risk * 0.58, 4)          # Parametric 95% 1-day VaR proxy
        sharpe = round(
            max(0.0, (self.expected_return or 0.0) - 0.0533) / risk, 2
        ) if risk > 0.001 else 1.42
        return {
            "id": self.id,
            "user_email": self.user_email,
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
            # Primary field names
            "current_weights": weights,
            "expected_return": self.expected_return,
            "current_risk": risk,
            "current_liquidity": self.current_liquidity,
            "health_score": self.health_score,
            "status": self.status,
            # Frontend alias fields (accessed as portfolio.allocations, portfolio.expected_risk etc.)
            "allocations": weights,
            "expected_risk": risk,
            "var_95": var_95,
            "sharpe_ratio": sharpe,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class DecisionHistory(Base):
    __tablename__ = "decision_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    user_email = Column(String(255), index=True, nullable=True)
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
            "user_email": self.user_email,
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


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    org_name = Column(String(255), nullable=False)
    org_type = Column(String(100), default="Bank")
    role = Column(String(100), default="Chief Risk Officer")
    
    # Onboarding profiling questions
    purpose = Column(Text, default="Basel III Regulatory Capital Defense")
    investment_horizon = Column(String(50), default="3-5 Years")
    risk_tolerance = Column(String(50), default="Balanced")
    regulatory_framework = Column(String(100), default="Basel III & RBI Guidelines")
    primary_assets_json = Column(Text, default='["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"]')
    initial_capital = Column(Float, default=1000000000.0)
    currency = Column(String(10), default="INR")
    onboarding_completed = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "org_name": self.org_name,
            "org_type": self.org_type,
            "role": self.role,
            "purpose": self.purpose,
            "investment_horizon": self.investment_horizon,
            "risk_tolerance": self.risk_tolerance,
            "regulatory_framework": self.regulatory_framework,
            "primary_assets": json.loads(self.primary_assets_json or "[]"),
            "initial_capital": self.initial_capital,
            "currency": self.currency,
            "onboarding_completed": bool(self.onboarding_completed),
            "isGuest": False,
            "created_at": self.created_at.isoformat() if self.created_at else None
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

