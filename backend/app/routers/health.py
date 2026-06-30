"""Health and service-status endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/status")
def status() -> dict:
    """Report which external integrations are live vs. running in mock mode."""
    s = get_settings()
    return {
        "app": s.app_name,
        "environment": s.environment,
        "integrations": {
            "groq_llm": s.llm_enabled,
            "gemini_embeddings": s.embeddings_enabled,
            "tavily_search": s.search_enabled,
            "pinecone_vector_store": s.vector_store_enabled,
            "supabase_database": s.database_enabled,
        },
        "mock_mode": not s.llm_enabled,
    }
