"""
main.py — FastAPI application exposing the AI agent as a REST API.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agent import run_agent
from memory import memory as conversation_memory

load_dotenv()

app = FastAPI(
    title="NexusAI Chatbot API",
    description="AI Agent with tool-calling and long-term memory",
    version="1.0.0",
)

# CORS — allow frontend and Express proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---

class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str
    tools_used: list[str] = []


class HistoryEntry(BaseModel):
    role: str
    content: str
    timestamp: str


# --- Endpoints ---

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "NexusAI",
        "version": "1.0.0"
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the AI agent and get a response.
    The agent may use tools (weather, search) and retrieves
    relevant past context from memory before responding.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not os.getenv("OPENROUTER_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not configured. Please set it in the .env file."
        )

    try:
        result = await run_agent(
            session_id=request.session_id,
            user_message=request.message
        )

        return ChatResponse(
            response=result["response"],
            session_id=request.session_id,
            tools_used=result.get("tools_used", [])
        )
    except Exception as e:
        print(f"Agent error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Agent processing error: {str(e)}"
        )


@app.get("/history/{session_id}")
async def get_history(session_id: str):
    """Get conversation history for a session."""
    try:
        history = conversation_memory.get_session_history(session_id)
        return {
            "session_id": session_id,
            "history": history
        }
    except Exception as e:
        print(f"History error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve history: {str(e)}"
        )


@app.get("/sessions")
async def get_sessions():
    """Get all active session IDs."""
    try:
        sessions = conversation_memory.get_all_sessions()
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
