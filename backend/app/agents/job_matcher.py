"""Job-matching agent.

Builds a query from the resume and target role, retrieves candidate jobs
from the vector store (Pinecone / in-memory), and ranks them.
"""
from __future__ import annotations

from app.agents.base import Agent
from app.models.schemas import GapAnalysis, JobMatch, ParsedResume
from app.services.vector_store import VectorStore, get_vector_store


class JobMatcherAgent(Agent):
    name = "job_matcher"

    def __init__(self, llm=None, store: VectorStore | None = None) -> None:
        super().__init__(llm)
        self.store = store or get_vector_store()

    def run(
        self, resume: ParsedResume, gap: GapAnalysis, *, top_k: int = 4
    ) -> list[JobMatch]:
        query = self._build_query(resume, gap)
        matches = self.store.query(query, top_k=top_k)

        jobs: list[JobMatch] = []
        for m in matches:
            score = m.get("score", 0.0)
            jobs.append(
                JobMatch(
                    title=m.get("title", "Unknown role"),
                    company=m.get("company", ""),
                    location=m.get("location", ""),
                    url=m.get("url", ""),
                    match_score=_to_percent(score),
                    reason=self._reason(m, resume, gap),
                )
            )
        return jobs

    @staticmethod
    def _build_query(resume: ParsedResume, gap: GapAnalysis) -> str:
        skills = ", ".join(resume.skills[:20])
        return (
            f"{gap.target_role}. Skills: {skills}. "
            f"Matched: {', '.join(gap.matched_skills)}."
        )

    @staticmethod
    def _reason(match: dict, resume: ParsedResume, gap: GapAnalysis) -> str:
        return (
            f"Aligns with your target of {gap.target_role} and overlaps with "
            f"your strengths ({', '.join(gap.matched_skills[:3]) or 'your skill set'})."
        )


def _to_percent(score: float) -> int:
    # Cosine similarity is in [-1, 1]; clamp and scale to a 0-100 score.
    pct = round(max(0.0, min(1.0, score)) * 100)
    return pct
