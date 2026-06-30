"""Orchestrator coordinating the CareerAtlas multi-agent pipeline.

Pipeline:
    1. ResumeParserAgent   -> structured resume
    2. GapAnalyzerAgent    -> matched / missing skills
    3. RoadmapResearchAgent-> grounded learning roadmap
    4. EvaluatorAgent      -> LLM-as-judge quality gate (one refinement retry)
    5. JobMatcherAgent     -> ranked job recommendations
"""
from __future__ import annotations

import uuid
from collections.abc import Iterator

from app.agents.evaluator import EvaluatorAgent
from app.agents.gap_analyzer import GapAnalyzerAgent
from app.agents.job_matcher import JobMatcherAgent
from app.agents.resume_parser import ResumeParserAgent
from app.agents.roadmap_researcher import RoadmapResearchAgent
from app.config import get_settings
from app.models.schemas import AnalyzeResponse, PipelineEvent
from app.services.database import get_database


class Orchestrator:
    def __init__(self) -> None:
        self.parser = ResumeParserAgent()
        self.gap_analyzer = GapAnalyzerAgent()
        self.researcher = RoadmapResearchAgent()
        self.evaluator = EvaluatorAgent()
        self.job_matcher = JobMatcherAgent()
        self.db = get_database()
        self.settings = get_settings()

    def run(self, resume_text: str, target_role: str) -> AnalyzeResponse:
        """Run the full pipeline and return the assembled response."""
        request_id = uuid.uuid4().hex[:12]

        resume = self.parser.run(resume_text)
        gap = self.gap_analyzer.run(resume, target_role)
        roadmap = self.researcher.run(gap)
        evaluation = self.evaluator.run(gap, roadmap)

        # One refinement pass if the judge rejects the first roadmap.
        if not evaluation.is_acceptable:
            roadmap = self.researcher.run(gap)
            evaluation = self.evaluator.run(gap, roadmap)

        jobs = self.job_matcher.run(resume, gap)

        response = AnalyzeResponse(
            request_id=request_id,
            target_role=target_role,
            resume=resume,
            gap_analysis=gap,
            roadmap=roadmap,
            roadmap_evaluation=evaluation,
            jobs=jobs,
            mock_mode=not self.settings.llm_enabled,
        )
        self._persist(response)
        return response

    def stream(self, resume_text: str, target_role: str) -> Iterator[PipelineEvent | AnalyzeResponse]:
        """Yield progress events per stage, then the final response.

        Useful for server-sent events so the UI can show live progress.
        """
        request_id = uuid.uuid4().hex[:12]

        yield PipelineEvent(stage="resume_parser", status="started")
        resume = self.parser.run(resume_text)
        yield PipelineEvent(
            stage="resume_parser",
            status="completed",
            detail=f"Found {len(resume.skills)} skills.",
        )

        yield PipelineEvent(stage="gap_analyzer", status="started")
        gap = self.gap_analyzer.run(resume, target_role)
        yield PipelineEvent(
            stage="gap_analyzer",
            status="completed",
            detail=f"Readiness {gap.readiness_score}% · {len(gap.missing_skills)} gaps.",
        )

        yield PipelineEvent(stage="roadmap_researcher", status="started")
        roadmap = self.researcher.run(gap)
        yield PipelineEvent(
            stage="roadmap_researcher",
            status="completed",
            detail=f"{len(roadmap.milestones)} milestones · {roadmap.total_weeks} weeks.",
        )

        yield PipelineEvent(stage="evaluator", status="started")
        evaluation = self.evaluator.run(gap, roadmap)
        if not evaluation.is_acceptable:
            yield PipelineEvent(
                stage="evaluator",
                status="completed",
                detail=f"Score {evaluation.score}/100 — refining roadmap.",
            )
            yield PipelineEvent(stage="roadmap_researcher", status="started", detail="refinement")
            roadmap = self.researcher.run(gap)
            evaluation = self.evaluator.run(gap, roadmap)
            yield PipelineEvent(stage="roadmap_researcher", status="completed", detail="refined")
        yield PipelineEvent(
            stage="evaluator",
            status="completed",
            detail=f"Score {evaluation.score}/100.",
        )

        yield PipelineEvent(stage="job_matcher", status="started")
        jobs = self.job_matcher.run(resume, gap)
        yield PipelineEvent(
            stage="job_matcher",
            status="completed",
            detail=f"{len(jobs)} job matches.",
        )

        response = AnalyzeResponse(
            request_id=request_id,
            target_role=target_role,
            resume=resume,
            gap_analysis=gap,
            roadmap=roadmap,
            roadmap_evaluation=evaluation,
            jobs=jobs,
            mock_mode=not self.settings.llm_enabled,
        )
        self._persist(response)
        yield response

    def _persist(self, response: AnalyzeResponse) -> None:
        try:
            self.db.save_analysis(
                {
                    "request_id": response.request_id,
                    "target_role": response.target_role,
                    "generated_at": response.generated_at.isoformat(),
                    "readiness_score": response.gap_analysis.readiness_score,
                    "roadmap_score": response.roadmap_evaluation.score,
                }
            )
        except Exception:
            # Persistence is best-effort; never fail the request on it.
            pass


_orchestrator: Orchestrator | None = None


def get_orchestrator() -> Orchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator()
    return _orchestrator
