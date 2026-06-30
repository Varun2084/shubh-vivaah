"""Gap analysis agent: compares a parsed resume against a target role."""
from __future__ import annotations

from app.agents.base import Agent
from app.models.schemas import GapAnalysis, ParsedResume, SkillGap

# Minimal role -> required-skill knowledge base for the heuristic fallback.
ROLE_REQUIREMENTS: dict[str, list[str]] = {
    "frontend engineer": [
        "javascript", "typescript", "react", "css", "html", "vite",
        "rest", "git", "system design",
    ],
    "backend engineer": [
        "python", "fastapi", "sql", "postgresql", "docker", "rest",
        "system design", "git", "ci/cd",
    ],
    "full stack developer": [
        "javascript", "react", "node.js", "fastapi", "sql", "docker",
        "rest", "git",
    ],
    "machine learning engineer": [
        "python", "machine learning", "deep learning", "pytorch", "nlp",
        "llm", "rag", "docker", "system design",
    ],
    "data scientist": [
        "python", "pandas", "numpy", "statistics", "machine learning",
        "sql", "data analysis",
    ],
    "ai engineer": [
        "python", "llm", "rag", "prompt engineering", "machine learning",
        "fastapi", "pinecone", "system design",
    ],
}

_DEFAULT_REQUIREMENTS = [
    "python", "git", "sql", "system design", "rest", "docker",
]

_SYSTEM = (
    "You are a career coach performing skill-gap analysis. Given a candidate's "
    "skills and a target role, identify matched skills and missing skills. "
    "Respond ONLY with JSON: "
    '{"matched_skills": [str], "missing_skills": [{"skill": str, '
    '"importance": "critical|high|medium|low", "rationale": str}], '
    '"readiness_score": int 0-100, "summary": str}.'
)


class GapAnalyzerAgent(Agent):
    name = "gap_analyzer"

    def run(self, resume: ParsedResume, target_role: str) -> GapAnalysis:
        if self.llm_available:
            user = (
                f"Target role: {target_role}\n"
                f"Candidate skills: {', '.join(resume.skills) or 'none listed'}\n"
                f"Years of experience: {resume.years_of_experience}"
            )
            data = self.llm.complete_json(_SYSTEM, user)
            if data:
                try:
                    return GapAnalysis(target_role=target_role, **data)
                except Exception:
                    pass
        return self._heuristic(resume, target_role)

    def _heuristic(self, resume: ParsedResume, target_role: str) -> GapAnalysis:
        required = ROLE_REQUIREMENTS.get(
            target_role.strip().lower(), _DEFAULT_REQUIREMENTS
        )
        have = {s.lower() for s in resume.skills}

        matched = [s for s in required if s in have]
        missing_skills = [s for s in required if s not in have]

        missing = []
        for i, skill in enumerate(missing_skills):
            # Earlier entries in the requirement list are treated as more core.
            importance = "critical" if i < 2 else "high" if i < 4 else "medium"
            missing.append(
                SkillGap(
                    skill=skill,
                    importance=importance,
                    rationale=f"{skill.title()} is commonly expected for a {target_role}.",
                )
            )

        readiness = round(100 * len(matched) / len(required)) if required else 0
        summary = (
            f"You match {len(matched)} of {len(required)} core skills for "
            f"{target_role}. Focus on the {len(missing)} gaps below to raise "
            f"your readiness from {readiness}%."
        )

        return GapAnalysis(
            target_role=target_role,
            matched_skills=matched,
            missing_skills=missing,
            readiness_score=readiness,
            summary=summary,
        )
