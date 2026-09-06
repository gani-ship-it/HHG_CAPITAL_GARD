import json
import hashlib
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import UserProfile, Portfolio
from app.services.optimizer import portfolio_optimizer

router = APIRouter()

DEMO_PERSONAS = [
    {
        "id": "cro",
        "title": "Chief Risk Officer",
        "name": "Dr. Elena Vance, CRO",
        "email": "cro@apexbank.com",
        "orgName": "Apex Reserve Bank",
        "orgType": "Central / Commercial Bank",
        "role": "Chief Risk Officer",
        "badge": "Risk Oversight",
        "purpose": "Basel III Regulatory Capital Defense & Pillar 1 VaR Headroom",
        "horizon": "3-5 Years",
        "riskTolerance": "Balanced",
        "framework": "Basel III & RBI Guidelines"
    },
    {
        "id": "pm",
        "title": "Senior Portfolio Manager",
        "name": "Marcus Sterling, CFA",
        "email": "pm@treasury.gov",
        "orgName": "State Reserve Treasury",
        "orgType": "Sovereign Wealth / Treasury",
        "role": "Portfolio Manager",
        "badge": "Asset Allocation",
        "purpose": "Convex Quadratic Programming (Clarabel QP) Portfolio De-risking",
        "horizon": "5-10 Years",
        "riskTolerance": "Growth",
        "framework": "RBI Master Directions"
    },
    {
        "id": "compliance",
        "title": "Compliance Auditor",
        "name": "Sarah Chen, CPA",
        "email": "auditor@finwatch.org",
        "orgName": "Financial Regulatory Oversight",
        "orgType": "Regulatory Oversight",
        "role": "Compliance Auditor",
        "badge": "Audit & Policy",
        "purpose": "Immutable Audit Ledger Archival & Solvency Supervision",
        "horizon": "1-3 Years",
        "riskTolerance": "Conservative",
        "framework": "Basel III & Solvency II"
    }
]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    org_name: str
    org_type: str = Field(default="Bank")
    role: str = Field(default="Chief Risk Officer")
    purpose: str = Field(default="Basel III Regulatory Capital Defense")
    investment_horizon: str = Field(default="3-5 Years")
    risk_tolerance: str = Field(default="Balanced")
    regulatory_framework: str = Field(default="Basel III & RBI Guidelines")
    primary_assets: List[str] = Field(default=["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"])
    initial_capital: float = Field(default=1000000000.0)
    currency: str = Field(default="INR")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.get("/personas")
def get_personas():
    """Returns preset institutional personas for 1-click judge access."""
    return {"personas": DEMO_PERSONAS}

@router.post("/guest")
def guest_login():
    """Provides an ephemeral guest trial session without permanent DB persistence."""
    return {
        "status": "success",
        "user": {
            "id": "guest_session",
            "email": "guest@capitalguard.internal",
            "full_name": "Institutional Guest",
            "org_name": "Demo Evaluation Sandbox",
            "org_type": "Bank",
            "role": "Guest Evaluator",
            "purpose": "Exploratory Evaluation & QP Stress Sandbox",
            "isGuest": True,
            "onboarding_completed": True
        }
    }

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a first-time institutional user with questionnaire profiling data,
    persists their profile in the database, and provisions their initial portfolio.
    """
    normalized_email = req.email.strip().lower()
    existing_user = db.query(UserProfile).filter(UserProfile.email == normalized_email).first()

    if existing_user:
        # Update existing profile
        existing_user.full_name = req.full_name
        existing_user.org_name = req.org_name
        existing_user.org_type = req.org_type
        existing_user.role = req.role
        existing_user.purpose = req.purpose
        existing_user.investment_horizon = req.investment_horizon
        existing_user.risk_tolerance = req.risk_tolerance
        existing_user.regulatory_framework = req.regulatory_framework
        existing_user.primary_assets_json = json.dumps(req.primary_assets)
        existing_user.initial_capital = req.initial_capital
        existing_user.currency = req.currency
        user_profile = existing_user
    else:
        user_profile = UserProfile(
            email=normalized_email,
            password_hash=hash_password(req.password),
            full_name=req.full_name,
            org_name=req.org_name,
            org_type=req.org_type,
            role=req.role,
            purpose=req.purpose,
            investment_horizon=req.investment_horizon,
            risk_tolerance=req.risk_tolerance,
            regulatory_framework=req.regulatory_framework,
            primary_assets_json=json.dumps(req.primary_assets),
            initial_capital=req.initial_capital,
            currency=req.currency,
            onboarding_completed=1
        )
        db.add(user_profile)

    db.commit()
    db.refresh(user_profile)

    # Automatically provision initial portfolio based on the user's answers
    risk_pref_map = {
        "Conservative": "Low",
        "Balanced": "Medium",
        "Growth": "High"
    }
    risk_pref = risk_pref_map.get(req.risk_tolerance, "Medium")
    max_risk_map = {
        "Conservative": 0.05,
        "Balanced": 0.07,
        "Growth": 0.09
    }
    max_risk = max_risk_map.get(req.risk_tolerance, 0.07)
    objective = "Capital Preservation" if req.risk_tolerance == "Conservative" else ("Growth" if req.risk_tolerance == "Growth" else "Balanced Growth")

    # Check if a portfolio already exists for this email
    portfolio = db.query(Portfolio).filter(Portfolio.user_email == normalized_email).first()
    if not portfolio:
        try:
            opt = portfolio_optimizer.optimize(
                total_capital=req.initial_capital,
                investment_objective=objective,
                risk_preference=risk_pref,
                min_liquidity=req.initial_capital * 0.20,
                max_risk_limit=max_risk,
                selected_assets=req.primary_assets,
                constraints={"equity_max": 0.30, "corpbonds_max": 0.25}
            )
            portfolio = Portfolio(
                user_email=normalized_email,
                org_name=req.org_name,
                org_type=req.org_type,
                total_capital=req.initial_capital,
                currency=req.currency,
                investment_horizon_years=3 if "3" in req.investment_horizon else 5,
                investment_objective=objective,
                risk_preference=risk_pref,
                min_liquidity=req.initial_capital * 0.20,
                max_risk_limit=max_risk,
                selected_assets_json=json.dumps(req.primary_assets),
                constraints_json=json.dumps({"equity_max": 0.30, "corpbonds_max": 0.25}),
                current_weights_json=json.dumps(opt["weights"]),
                expected_return=opt["expected_return"],
                current_risk=opt["expected_risk"],
                current_liquidity=opt["current_liquidity"],
                health_score=opt["health_score"],
                status=opt["status"]
            )
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)
        except Exception as e:
            # Fallback if solver fails
            portfolio = db.query(Portfolio).filter(Portfolio.id == 1).first()

    return {
        "status": "success",
        "user": user_profile.to_dict(),
        "portfolio": portfolio.to_dict() if portfolio else None
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Direct login for existing registered users.
    Retrieves profile and existing portfolio without re-asking onboarding questions.
    """
    normalized_email = req.email.strip().lower()

    # 1. Check if user profile exists in database
    user = db.query(UserProfile).filter(UserProfile.email == normalized_email).first()

    # 2. Check if this is one of our demo personas
    demo_match = next((p for p in DEMO_PERSONAS if p["email"].lower() == normalized_email), None)

    if not user and demo_match:
        # Auto-seed the demo persona in DB so its portfolio and audit records persist!
        user = UserProfile(
            email=demo_match["email"],
            password_hash=hash_password(req.password or "demo123"),
            full_name=demo_match["name"],
            org_name=demo_match["orgName"],
            org_type=demo_match["orgType"],
            role=demo_match["role"],
            purpose=demo_match["purpose"],
            investment_horizon=demo_match["horizon"],
            risk_tolerance=demo_match["riskTolerance"],
            regulatory_framework=demo_match["framework"],
            onboarding_completed=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please register your institutional account.")

    # Retrieve portfolio linked to this user or fallback to portfolio #1
    portfolio = db.query(Portfolio).filter(Portfolio.user_email == normalized_email).first()
    if not portfolio:
        portfolio = db.query(Portfolio).filter(Portfolio.id == 1).first()

    return {
        "status": "success",
        "user": user.to_dict(),
        "portfolio": portfolio.to_dict() if portfolio else None
    }

@router.get("/profile/{email}")
def get_profile(email: str, db: Session = Depends(get_db)):
    """Retrieves user profile and onboarding status."""
    user = db.query(UserProfile).filter(UserProfile.email == email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user.to_dict()

@router.api_route("/guest", methods=["GET", "POST"])
def get_guest_session(db: Session = Depends(get_db)):
    """
    Returns an ephemeral guest session with sample institutional data.
    Audit history for guests will NOT be persisted in the database.
    """
    sample_portfolio = db.query(Portfolio).filter(Portfolio.id == 1).first()
    portfolio_data = sample_portfolio.to_dict() if sample_portfolio else {
        "id": 1,
        "org_name": "Sample Reserve Bank (Guest)",
        "org_type": "Bank",
        "total_capital": 1000000000.0,
        "currency": "INR",
        "investment_horizon_years": 3,
        "investment_objective": "Balanced Growth",
        "risk_preference": "Medium",
        "min_liquidity": 200000000.0,
        "max_risk_limit": 0.07,
        "current_weights": {"GovBonds": 0.35, "CorpBonds": 0.25, "Equity": 0.20, "Gold": 0.10, "Cash": 0.10},
        "allocations": {"GovBonds": 0.35, "CorpBonds": 0.25, "Equity": 0.20, "Gold": 0.10, "Cash": 0.10},
        "expected_return": 0.082,
        "current_risk": 0.054,
        "expected_risk": 0.054,
        "health_score": 88.5,
        "status": "SAFE"
    }

    return {
        "status": "success",
        "is_guest": True,
        "user": {
            "id": "guest-session",
            "email": "guest@capitalguard.internal",
            "full_name": "Guest Risk Officer",
            "org_name": "Sandbox Test Reserve",
            "org_type": "Central / Commercial Bank",
            "role": "Guest Risk Officer",
            "purpose": "Evaluation & Clarabel QP Sandbox Testing",
            "isGuest": True,
            "onboarding_completed": 1
        },
        "portfolio": portfolio_data
    }

