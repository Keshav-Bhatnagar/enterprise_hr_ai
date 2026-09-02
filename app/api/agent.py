from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.agents.orchestrator import run_agent_query
from app.api.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"], dependencies=[Depends(get_current_user)])

class ChatRequest(BaseModel):
    # employee_id is still passed by the UI but the query itself defines what we want
    employee_id: int 
    message: str

@router.post("/chat")
def chat_with_agent(req: ChatRequest, user = Depends(get_current_user)):
    try:
        # We pass the user's role to the agent so it can enforce permissions
        reply = run_agent_query(req.message, user_role=user.role)
        
        return {
            "reply": reply,
            "intent_routed": "agentic_llm"
        }
    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        return {
            "reply": f"Agent encountered an error: {e}",
            "intent_routed": "error"
        }

@router.post("/execute")
def execute_with_agent(req: ChatRequest, user = Depends(get_current_user)):
    from app.agents.orchestrator import run_execution_agent_query
    try:
        reply = run_execution_agent_query(req.message, user_role=user.role)
        return {
            "reply": reply,
            "intent_routed": "execution_llm"
        }
    except Exception as e:
        logger.error(f"Execution Agent error: {e}")
        return {
            "reply": f"❌ Agent encountered an error: {e}",
            "intent_routed": "error"
        }
