"""Application configuration loaded from environment variables.

CareerAtlas integrates several external services (Groq, Gemini, Tavily,
Pinecone, Supabase). When the corresponding API keys are absent the app
runs in a degraded "mock" mode so the full agentic workflow can still be
demonstrated end-to-end without live credentials.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    app_name: str = "CareerAtlas"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Groq (LLMs) ---
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    # --- Gemini (embeddings) ---
    gemini_api_key: str | None = None
    gemini_embedding_model: str = "models/text-embedding-004"

    # --- Tavily (web search) ---
    tavily_api_key: str | None = None

    # --- Pinecone (vector store) ---
    pinecone_api_key: str | None = None
    pinecone_index: str = "careeratlas-jobs"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"

    # --- Supabase (persistence) ---
    supabase_url: str | None = None
    supabase_key: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def llm_enabled(self) -> bool:
        return bool(self.groq_api_key)

    @property
    def embeddings_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def search_enabled(self) -> bool:
        return bool(self.tavily_api_key)

    @property
    def vector_store_enabled(self) -> bool:
        return bool(self.pinecone_api_key)

    @property
    def database_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
