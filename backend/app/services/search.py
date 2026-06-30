"""Tavily web-search wrapper used to ground roadmap research.

Without an API key it returns curated placeholder results so the roadmap
agent still produces resource links during local development.
"""
from __future__ import annotations

import logging

from app.config import get_settings

logger = logging.getLogger(__name__)


class SearchResult:
    def __init__(self, title: str, url: str, content: str = "") -> None:
        self.title = title
        self.url = url
        self.content = content


class SearchClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = None
        if self._settings.search_enabled:
            try:
                from tavily import TavilyClient

                self._client = TavilyClient(api_key=self._settings.tavily_api_key)
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Tavily init failed, using mock search: %s", exc)

    @property
    def available(self) -> bool:
        return self._client is not None

    def search(self, query: str, *, max_results: int = 4) -> list[SearchResult]:
        if self._client:
            try:
                resp = self._client.search(
                    query=query,
                    max_results=max_results,
                    search_depth="basic",
                )
                return [
                    SearchResult(
                        title=r.get("title", query),
                        url=r.get("url", ""),
                        content=r.get("content", ""),
                    )
                    for r in resp.get("results", [])
                ]
            except Exception as exc:  # pragma: no cover - network dependent
                logger.error("Tavily search failed, falling back: %s", exc)
        return _mock_results(query, max_results)


def _mock_results(query: str, max_results: int) -> list[SearchResult]:
    skill = query.split("learn")[-1].strip() if "learn" in query else query
    base = [
        SearchResult(
            f"{skill} — Official Documentation",
            f"https://www.google.com/search?q={skill.replace(' ', '+')}+documentation",
            f"Authoritative reference material for {skill}.",
        ),
        SearchResult(
            f"Top {skill} Courses (2025)",
            f"https://www.google.com/search?q=best+{skill.replace(' ', '+')}+course",
            f"Curated, project-based courses for mastering {skill}.",
        ),
        SearchResult(
            f"{skill}: A Practical Guide",
            f"https://www.google.com/search?q={skill.replace(' ', '+')}+tutorial",
            f"Hands-on tutorial covering core {skill} concepts.",
        ),
        SearchResult(
            f"Build a project with {skill}",
            f"https://www.google.com/search?q={skill.replace(' ', '+')}+project+ideas",
            f"Project ideas to apply {skill} in a portfolio.",
        ),
    ]
    return base[:max_results]


_search: SearchClient | None = None


def get_search() -> SearchClient:
    global _search
    if _search is None:
        _search = SearchClient()
    return _search
