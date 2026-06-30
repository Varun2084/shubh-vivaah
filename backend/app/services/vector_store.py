"""Pinecone-backed job index with an in-memory cosine-similarity fallback.

The fallback is seeded with a small sample job catalogue so the
job-matching agent returns ranked results without external services.
"""
from __future__ import annotations

import logging

from app.services.embeddings import get_embeddings

logger = logging.getLogger(__name__)


SAMPLE_JOBS: list[dict] = [
    {
        "id": "job-1",
        "title": "Frontend Engineer",
        "company": "Brightwave",
        "location": "Remote",
        "url": "https://example.com/jobs/frontend-engineer",
        "text": "React TypeScript Vite frontend engineer building accessible web apps with REST APIs and component testing.",
    },
    {
        "id": "job-2",
        "title": "Machine Learning Engineer",
        "company": "Northstar AI",
        "location": "Bengaluru, IN",
        "url": "https://example.com/jobs/ml-engineer",
        "text": "Python machine learning engineer working on LLMs, embeddings, retrieval augmented generation, vector databases and MLOps.",
    },
    {
        "id": "job-3",
        "title": "Backend Engineer",
        "company": "Cloudpath",
        "location": "Remote",
        "url": "https://example.com/jobs/backend-engineer",
        "text": "FastAPI Python backend engineer designing scalable APIs, PostgreSQL, Docker, and event-driven services.",
    },
    {
        "id": "job-4",
        "title": "Data Scientist",
        "company": "Quantify",
        "location": "Hyderabad, IN",
        "url": "https://example.com/jobs/data-scientist",
        "text": "Data scientist with Python, pandas, statistics, machine learning, SQL and data visualization experience.",
    },
    {
        "id": "job-5",
        "title": "Full Stack Developer",
        "company": "Loopwork",
        "location": "Remote",
        "url": "https://example.com/jobs/full-stack-developer",
        "text": "Full stack developer with React, Node.js, FastAPI, Postgres and cloud deployment building end to end products.",
    },
    {
        "id": "job-6",
        "title": "AI Product Engineer",
        "company": "Synthesis Labs",
        "location": "Remote",
        "url": "https://example.com/jobs/ai-product-engineer",
        "text": "AI product engineer integrating LLM agents, prompt engineering, RAG pipelines and React frontends into products.",
    },
]


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


class VectorStore:
    def __init__(self) -> None:
        from app.config import get_settings

        self._settings = get_settings()
        self._embeddings = get_embeddings()
        self._index = None
        self._memory: list[dict] = []
        if self._settings.vector_store_enabled:
            self._init_pinecone()
        if self._index is None:
            self._seed_memory()

    def _init_pinecone(self) -> None:
        try:
            from pinecone import Pinecone, ServerlessSpec

            pc = Pinecone(api_key=self._settings.pinecone_api_key)
            existing = {i["name"] for i in pc.list_indexes()}
            if self._settings.pinecone_index not in existing:
                from app.services.embeddings import EMBED_DIM

                pc.create_index(
                    name=self._settings.pinecone_index,
                    dimension=EMBED_DIM,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud=self._settings.pinecone_cloud,
                        region=self._settings.pinecone_region,
                    ),
                )
            self._index = pc.Index(self._settings.pinecone_index)
            self._ensure_seeded_pinecone()
        except Exception as exc:  # pragma: no cover - network dependent
            logger.warning("Pinecone init failed, using in-memory store: %s", exc)
            self._index = None

    def _seed_memory(self) -> None:
        for job in SAMPLE_JOBS:
            self._memory.append(
                {**job, "vector": self._embeddings.embed(job["text"])}
            )

    def _ensure_seeded_pinecone(self) -> None:  # pragma: no cover - network dependent
        try:
            stats = self._index.describe_index_stats()
            if stats.get("total_vector_count", 0) > 0:
                return
            vectors = [
                {
                    "id": job["id"],
                    "values": self._embeddings.embed(job["text"]),
                    "metadata": {
                        k: v for k, v in job.items() if k not in {"id", "text"}
                    },
                }
                for job in SAMPLE_JOBS
            ]
            self._index.upsert(vectors=vectors)
        except Exception as exc:
            logger.warning("Pinecone seed failed: %s", exc)

    def query(self, text: str, *, top_k: int = 4) -> list[dict]:
        vector = self._embeddings.embed(text)
        if self._index is not None:  # pragma: no cover - network dependent
            try:
                res = self._index.query(
                    vector=vector, top_k=top_k, include_metadata=True
                )
                return [
                    {**m.get("metadata", {}), "score": m.get("score", 0.0)}
                    for m in res.get("matches", [])
                ]
            except Exception as exc:
                logger.error("Pinecone query failed, falling back: %s", exc)
        scored = [
            {
                k: v
                for k, v in job.items()
                if k not in {"vector", "text"}
            }
            | {"score": _cosine(vector, job["vector"])}
            for job in self._memory
        ]
        scored.sort(key=lambda j: j["score"], reverse=True)
        return scored[:top_k]


_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
