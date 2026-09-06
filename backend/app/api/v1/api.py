from fastapi import APIRouter
from app.api.v1.endpoints import portfolio, monitoring, rebalance, simulator, history, copilot, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Onboarding"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio Optimization"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Continuous Monitoring & VaR"])
api_router.include_router(rebalance.router, prefix="/rebalance", tags=["Cost-Aware Rebalancing"])
api_router.include_router(simulator.router, prefix="/simulator", tags=["Scenario Stress Simulator"])
api_router.include_router(history.router, prefix="/history", tags=["Audit & Decision History"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Capital Guard AI Copilot"])


