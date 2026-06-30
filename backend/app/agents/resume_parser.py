"""Resume parsing agent: free-form resume text -> structured ParsedResume."""
from __future__ import annotations

import re

from app.agents.base import Agent
from app.models.schemas import ParsedResume, WorkExperience

# A compact, well-known skill vocabulary used by the heuristic fallback.
SKILL_VOCAB = [
    "python", "javascript", "typescript", "java", "c++", "go", "rust", "sql",
    "react", "vue", "angular", "node.js", "next.js", "vite", "fastapi", "django",
    "flask", "express", "spring", "graphql", "rest", "html", "css", "tailwind",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ci/cd",
    "postgresql", "mysql", "mongodb", "redis", "pinecone", "supabase",
    "machine learning", "deep learning", "nlp", "llm", "rag", "pandas",
    "numpy", "pytorch", "tensorflow", "scikit-learn", "data analysis",
    "statistics", "git", "linux", "agile", "system design", "prompt engineering",
]

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_YEARS_RE = re.compile(r"(\d+(?:\.\d+)?)\+?\s*years?", re.IGNORECASE)

_SYSTEM = (
    "You are a meticulous resume parser. Extract structured data from the "
    "resume and respond ONLY with a JSON object matching this shape: "
    '{"name": str, "email": str, "summary": str, "skills": [str], '
    '"experience": [{"title": str, "company": str, "duration": str, '
    '"highlights": [str]}], "education": [str], "years_of_experience": number}.'
)


class ResumeParserAgent(Agent):
    name = "resume_parser"

    def run(self, resume_text: str) -> ParsedResume:
        if self.llm_available:
            data = self.llm.complete_json(_SYSTEM, resume_text)
            if data:
                try:
                    return ParsedResume(**data)
                except Exception:
                    pass
        return self._heuristic(resume_text)

    def _heuristic(self, text: str) -> ParsedResume:
        lower = text.lower()
        skills = sorted(
            {s for s in SKILL_VOCAB if re.search(rf"\b{re.escape(s)}\b", lower)}
        )

        email_match = _EMAIL_RE.search(text)
        email = email_match.group(0) if email_match else ""

        years = 0.0
        year_matches = [float(m) for m in _YEARS_RE.findall(text)]
        if year_matches:
            years = max(year_matches)

        # First non-empty line is treated as the candidate name.
        name = ""
        for line in text.splitlines():
            stripped = line.strip()
            if stripped and "@" not in stripped and len(stripped.split()) <= 5:
                name = stripped
                break

        summary = ""
        for line in text.splitlines():
            if line.strip():
                summary = line.strip()[:280]
                if name and summary == name:
                    summary = ""
                    continue
                break

        return ParsedResume(
            name=name,
            email=email,
            summary=summary,
            skills=skills,
            experience=self._extract_experience(text),
            education=self._extract_education(text),
            years_of_experience=years,
        )

    @staticmethod
    def _extract_experience(text: str) -> list[WorkExperience]:
        experiences: list[WorkExperience] = []
        # Look for "Title at Company" or "Title, Company" patterns.
        pattern = re.compile(
            r"^(?P<title>[A-Z][\w/ +&-]{2,40})\s+(?:at|,|@|-)\s+(?P<company>[A-Z][\w.& -]{1,40})",
            re.MULTILINE,
        )
        for m in pattern.finditer(text):
            experiences.append(
                WorkExperience(
                    title=m.group("title").strip(),
                    company=m.group("company").strip(),
                )
            )
            if len(experiences) >= 5:
                break
        return experiences

    @staticmethod
    def _extract_education(text: str) -> list[str]:
        edu = []
        for line in text.splitlines():
            if re.search(
                r"\b(b\.?tech|m\.?tech|bachelor|master|b\.?sc|m\.?sc|ph\.?d|degree|university|college)\b",
                line,
                re.IGNORECASE,
            ):
                edu.append(line.strip())
        return edu[:4]
