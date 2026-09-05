from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.assistant_service import capital_guard_copilot

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question to Capital Guard Copilot")
    portfolio_id: Optional[int] = Field(default=None, description="Optional target portfolio ID for context injection")


@router.get("/status")
def get_copilot_status():
    """
    Returns AI Copilot status, active inference engine (Groq LPU vs Air-Gapped Rule Engine),
    and privacy compliance standard.
    """
    return capital_guard_copilot.get_status()


@router.post("/chat")
def chat_with_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Executes conversational Q&A with Capital Guard Copilot.
    Injects real-time portfolio metrics, binding CVXPY constraints, and FRED yields.
    Preserves multi-turn conversation memory in Supabase / Postgres.
    """
    try:
        response = capital_guard_copilot.ask_copilot(
            user_message=req.message,
            portfolio_id=req.portfolio_id,
            db=db
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot inference error: {str(e)}")


@router.get("/history")
def get_chat_history(
    portfolio_id: Optional[int] = Query(None, description="Portfolio ID filter"),
    limit: int = Query(30, description="Max messages to fetch"),
    db: Session = Depends(get_db)
):
    """
    Retrieves stored multi-turn conversation history for a portfolio session.
    """
    try:
        messages = capital_guard_copilot.get_chat_history(portfolio_id=portfolio_id, db=db, limit=limit)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")


@router.delete("/history")
def clear_chat_history(
    portfolio_id: Optional[int] = Query(None, description="Portfolio ID filter"),
    db: Session = Depends(get_db)
):
    """
    Clears the stored conversation history.
    """
    try:
        capital_guard_copilot.clear_chat_history(portfolio_id=portfolio_id, db=db)
        return {"status": "success", "message": "Conversation history cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear chat history: {str(e)}")
