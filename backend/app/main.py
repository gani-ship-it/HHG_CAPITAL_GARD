import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import Base, engine, supabase_client
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("capital_guard")

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Capital Allocation, Convex Optimization (CVXPY), Continuous Risk Control, and Cost-Aware Rebalancing Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "supabase" if settings.is_supabase_configured else "sqlite_fallback",
        "supabase_connected": supabase_client is not None,
        "optimizer_engine": "CVXPY (QP Clarabel/OSQP)",
        "risk_models": ["Historical VaR 95%", "Peak-to-Trough Drawdown", "Annualized Volatility"]
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Welcome to Capital Guard API. Access Swagger docs at /docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
