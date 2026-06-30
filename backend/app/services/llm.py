"""Thin wrapper around the Groq chat-completions API.

Falls back to a deterministic local stub when no API key is configured so
the agent pipeline remains exercisable in development and CI.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client: Any | None = None
        if self._settings.llm_enabled:
            try:
                from groq import Groq

                self._client = Groq(api_key=self._settings.groq_api_key)
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Groq client init failed, using mock LLM: %s", exc)

    @property
    def available(self) -> bool:
        return self._client is not None

    def complete(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        if not self._client:
            return ""
        try:
            resp = self._client.chat.completions.create(
                model=self._settings.groq_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return resp.choices[0].message.content or ""
        except Exception as exc:  # pragma: no cover - network dependent
            logger.error("Groq completion failed: %s", exc)
            return ""

    def complete_json(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> dict | None:
        """Request a JSON object response and parse it defensively."""
        if not self._client:
            return None
        try:
            resp = self._client.chat.completions.create(
                model=self._settings.groq_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            content = resp.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as exc:  # pragma: no cover - network dependent
            logger.error("Groq JSON completion failed: %s", exc)
            return None


_llm: LLMClient | None = None


def get_llm() -> LLMClient:
    global _llm
    if _llm is None:
        _llm = LLMClient()
    return _llm
