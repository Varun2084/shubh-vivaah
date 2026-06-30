"""Base class for CareerAtlas agents.

Each agent encapsulates one stage of the pipeline. Agents prefer the LLM
when available and degrade to deterministic heuristics otherwise, so the
whole workflow remains demonstrable without credentials.
"""
from __future__ import annotations

from app.services.llm import LLMClient, get_llm


class Agent:
    name: str = "agent"

    def __init__(self, llm: LLMClient | None = None) -> None:
        self.llm = llm or get_llm()

    @property
    def llm_available(self) -> bool:
        return self.llm.available
