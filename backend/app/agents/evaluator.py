"""Quality-evaluation agent (LLM-as-judge) for generated roadmaps.

Scores a roadmap on coverage, ordering, and groundedness. The orchestrator
uses the verdict to optionally trigger one refinement pass.
"""
from __future__ import annotations

from app.agents.base import Agent
from app.models.schemas import GapAnalysis, Roadmap, RoadmapEvaluation

_ACCEPT_THRESHOLD = 70

_SYSTEM = (
    "You are a strict quality evaluator (LLM-as-judge) for learning roadmaps. "
    "Judge whether the roadmap fully covers the candidate's skill gaps, orders "
    "milestones foundation-first, gives realistic timelines, and links useful "
    "resources. Respond ONLY with JSON: "
    '{"score": int 0-100, "is_acceptable": bool, "strengths": [str], '
    '"weaknesses": [str], "feedback": str}.'
)


class EvaluatorAgent(Agent):
    name = "evaluator"

    def run(self, gap: GapAnalysis, roadmap: Roadmap) -> RoadmapEvaluation:
        if self.llm_available:
            user = (
                f"Target role: {gap.target_role}\n"
                f"Gaps to cover: {', '.join(g.skill for g in gap.missing_skills) or 'none'}\n"
                f"Roadmap milestones: "
                + "; ".join(
                    f"{m.title} ({m.estimated_weeks}w, {len(m.resources)} resources)"
                    for m in roadmap.milestones
                )
            )
            data = self.llm.complete_json(_SYSTEM, user)
            if data:
                try:
                    return RoadmapEvaluation(**data)
                except Exception:
                    pass
        return self._heuristic(gap, roadmap)

    def _heuristic(self, gap: GapAnalysis, roadmap: Roadmap) -> RoadmapEvaluation:
        gap_skills = {g.skill.lower() for g in gap.missing_skills}
        covered = {m.skill.lower() for m in roadmap.milestones}
        coverage = len(gap_skills & covered) / len(gap_skills) if gap_skills else 1.0

        grounded = [m for m in roadmap.milestones if m.resources]
        grounded_ratio = (
            len(grounded) / len(roadmap.milestones) if roadmap.milestones else 0.0
        )

        # Foundation-first ordering: critical/high gaps should appear early.
        order_rank = {g.skill.lower(): i for i, g in enumerate(gap.missing_skills)}
        ordering_ok = all(
            order_rank.get(roadmap.milestones[i].skill.lower(), 0)
            <= order_rank.get(roadmap.milestones[i + 1].skill.lower(), 0)
            for i in range(len(roadmap.milestones) - 1)
        )

        score = round(
            100 * (0.5 * coverage + 0.3 * grounded_ratio + 0.2 * (1.0 if ordering_ok else 0.0))
        )

        strengths, weaknesses = [], []
        if coverage >= 0.99:
            strengths.append("Covers every identified skill gap.")
        else:
            weaknesses.append("Some skill gaps are not addressed by any milestone.")
        if grounded_ratio >= 0.99:
            strengths.append("Every milestone links to learning resources.")
        elif grounded_ratio < 0.5:
            weaknesses.append("Several milestones lack grounding resources.")
        if ordering_ok:
            strengths.append("Milestones are ordered foundation-first.")
        else:
            weaknesses.append("Milestone ordering does not prioritise critical gaps.")

        return RoadmapEvaluation(
            score=score,
            is_acceptable=score >= _ACCEPT_THRESHOLD,
            strengths=strengths,
            weaknesses=weaknesses,
            feedback=(
                f"Roadmap scored {score}/100 "
                f"(coverage {coverage:.0%}, grounding {grounded_ratio:.0%})."
            ),
        )
