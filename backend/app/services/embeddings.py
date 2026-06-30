"""Gemini text-embedding wrapper with a deterministic local fallback."""
from __future__ import annotations

import hashlib
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)

# Gemini text-embedding-004 produces 768-dim vectors.
EMBED_DIM = 768


class EmbeddingClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._enabled = self._settings.embeddings_enabled
        if self._enabled:
            try:
                import google.generativeai as genai

                genai.configure(api_key=self._settings.gemini_api_key)
                self._genai = genai
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Gemini init failed, using hashed embeddings: %s", exc)
                self._enabled = False

    @property
    def available(self) -> bool:
        return self._enabled

    def embed(self, text: str) -> list[float]:
        if self._enabled:
            try:
                result = self._genai.embed_content(
                    model=self._settings.gemini_embedding_model,
                    content=text,
                )
                return result["embedding"]
            except Exception as exc:  # pragma: no cover - network dependent
                logger.error("Gemini embed failed, falling back: %s", exc)
        return _hashed_embedding(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(t) for t in texts]


def _hashed_embedding(text: str, dim: int = EMBED_DIM) -> list[float]:
    """Cheap deterministic embedding for offline/mock mode.

    Hashes tokens into buckets and L2-normalises. Not semantically rich,
    but stable and good enough to demonstrate vector similarity flows.
    """
    vec = [0.0] * dim
    for token in text.lower().split():
        h = int(hashlib.md5(token.encode()).hexdigest(), 16)
        vec[h % dim] += 1.0
    norm = sum(v * v for v in vec) ** 0.5
    if norm == 0:
        return vec
    return [v / norm for v in vec]


_embeddings: EmbeddingClient | None = None


def get_embeddings() -> EmbeddingClient:
    global _embeddings
    if _embeddings is None:
        _embeddings = EmbeddingClient()
    return _embeddings
