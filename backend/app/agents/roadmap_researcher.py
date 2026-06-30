"""Roadmap research agent.

Turns identified skill gaps into an ordered learning roadmap, grounding each
milestone with web-search resources (Tavily) when available.
"""
from __future__ import annotations

from app.agents.base import Agent
from app.models.schemas import (
    GapAnalysis,
    Roadmap,
    RoadmapMilestone,
    RoadmapResource,
)
from app.services.search import SearchClient, get_search

# Effort heuristic (weeks) by gap importance.
_WEEKS_BY_IMPORTANCE = {"critical": 4, "high": 3, "medium": 2, "low": 1}

_SYSTEM = (
    "You are a curriculum designer. Given a target role and prioritized skill "
    "gaps with grounding resources, produce an ordered learning roadmap. "
    "Order milestones so foundational skills come first. Respond ONLY with "
    'JSON: {"milestones": [{"title": str, "skill": str, "estimated_weeks": '
    'int, "description": str, "resources": [{"title": str, "url": str, '
    '"type": "course|article|documentation|video|project"}]}]}.'
)


class RoadmapResearchAgent(Agent):
    name = "roadmap_researcher"

    def __init__(self, llm=None, search: SearchClient | None = None) -> None:
        super().__init__(llm)
        self.search = search or get_search()

    def run(self, gap: GapAnalysis) -> Roadmap:
        # Sort gaps by importance so the roadmap is foundation-first.
        order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        gaps = sorted(gap.missing_skills, key=lambda g: order.get(g.importance, 9))

        # Ground each skill with web resources.
        grounded: list[tuple] = []
        for sg in gaps:
            results = self.search.search(f"best way to learn {sg.skill}", max_results=3)
            resources = [
                RoadmapResource(
                    title=r.title,
                    url=r.url,
                    type=_guess_type(r.title),
                )
                for r in results
            ]
            grounded.append((sg, resources))

        if self.llm_available:
            roadmap = self._llm_roadmap(gap.target_role, grounded)
            if roadmap:
                return roadmap
        return self._heuristic(gap.target_role, grounded)

    def _llm_roadmap(self, target_role: str, grounded: list[tuple]) -> Roadmap | None:
        lines = [f"Target role: {target_role}", "Skill gaps and resources:"]
        for sg, resources in grounded:
            lines.append(f"- {sg.skill} ({sg.importance}): {sg.rationale}")
            for r in resources:
                lines.append(f"    * {r.title} -> {r.url}")
        data = self.llm.complete_json(_SYSTEM, "\n".join(lines), max_tokens=3000)
        if not data:
            return None
        try:
            milestones = [RoadmapMilestone(**m) for m in data.get("milestones", [])]
            # Re-attach grounded resources if the LLM dropped them.
            res_by_skill = {sg.skill.lower(): res for sg, res in grounded}
            for m in milestones:
                if not m.resources and m.skill.lower() in res_by_skill:
                    m.resources = res_by_skill[m.skill.lower()]
            total = sum(m.estimated_weeks for m in milestones)
            return Roadmap(
                target_role=target_role, milestones=milestones, total_weeks=total
            )
        except Exception:
            return None

    def _heuristic(self, target_role: str, grounded: list[tuple]) -> Roadmap:
        milestones: list[RoadmapMilestone] = []
        for sg, resources in grounded:
            weeks = _WEEKS_BY_IMPORTANCE.get(sg.importance, 2)
            milestones.append(
                RoadmapMilestone(
                    title=f"Learn {sg.skill.title()}",
                    skill=sg.skill,
                    estimated_weeks=weeks,
                    description=(
                        f"Build working proficiency in {sg.skill}. {sg.rationale} "
                        f"Finish with a small project that uses {sg.skill} in a "
                        f"{target_role} context."
                    ),
                    resources=resources,
                )
            )
        total = sum(m.estimated_weeks for m in milestones)
        return Roadmap(
            target_role=target_role, milestones=milestones, total_weeks=total
        )


def _guess_type(title: str) -> str:
    t = title.lower()
    if "course" in t:
        return "course"
    if "documentation" in t or "docs" in t:
        return "documentation"
    if "video" in t or "youtube" in t:
        return "video"
    if "project" in t or "build" in t:
        return "project"
    return "article"
