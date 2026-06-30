"""Supabase persistence for analysis runs.

When Supabase is not configured, runs are kept in an in-memory ring buffer
so the history endpoint still works during local development.
"""
from __future__ import annotations

import logging
from collections import deque
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)

_TABLE = "analyses"


class Database:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = None
        self._memory: deque[dict] = deque(maxlen=50)
        if self._settings.database_enabled:
            try:
                from supabase import create_client

                self._client = create_client(
                    self._settings.supabase_url, self._settings.supabase_key
                )
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Supabase init failed, using in-memory store: %s", exc)

    @property
    def available(self) -> bool:
        return self._client is not None

    def save_analysis(self, record: dict[str, Any]) -> None:
        if self._client:
            try:
                self._client.table(_TABLE).insert(record).execute()
                return
            except Exception as exc:  # pragma: no cover - network dependent
                logger.error("Supabase insert failed, storing in memory: %s", exc)
        self._memory.appendleft(record)

    def recent_analyses(self, limit: int = 10) -> list[dict]:
        if self._client:
            try:
                res = (
                    self._client.table(_TABLE)
                    .select("request_id, target_role, generated_at")
                    .order("generated_at", desc=True)
                    .limit(limit)
                    .execute()
                )
                return res.data or []
            except Exception as exc:  # pragma: no cover - network dependent
                logger.error("Supabase select failed, reading memory: %s", exc)
        return [
            {
                "request_id": r["request_id"],
                "target_role": r["target_role"],
                "generated_at": r["generated_at"],
            }
            for r in list(self._memory)[:limit]
        ]


_db: Database | None = None


def get_database() -> Database:
    global _db
    if _db is None:
        _db = Database()
    return _db
