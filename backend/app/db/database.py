from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Determine database URL
db_url = settings.DATABASE_URL.strip() if settings.DATABASE_URL else ""
if not db_url or ("postgresql://" in db_url and "[YOUR-PASSWORD]" in db_url):
    logger.warning("PostgreSQL credentials incomplete in .env. Falling back to local SQLite database.")
    db_url = "sqlite:///./capital_guard.db"

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Optional Supabase Python Client
supabase_client = None
if settings.is_supabase_configured and "supabase.co" in settings.SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}")
