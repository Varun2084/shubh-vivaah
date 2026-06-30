"""Pydantic models shared across the API and the agent pipeline."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# Resume parsing
# --------------------------------------------------------------------------- #
class WorkExperience(BaseModel):
    title: str = ""
    company: str = ""
    duration: str = ""
    highlights: list[str] = Field(default_factory=list)


class ParsedResume(BaseModel):
    name: str = ""
    email: str = ""
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    experience: list[WorkExperience] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    years_of_experience: float = 0.0


# --------------------------------------------------------------------------- #
# Gap analysis
# --------------------------------------------------------------------------- #
class SkillGap(BaseModel):
    skill: str
    importance: Literal["critical", "high", "medium", "low"] = "medium"
    rationale: str = ""


class GapAnalysis(BaseModel):
    target_role: str
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[SkillGap] = Field(default_factory=list)
    readiness_score: int = Field(0, ge=0, le=100)
    summary: str = ""


# --------------------------------------------------------------------------- #
# Roadmap
# --------------------------------------------------------------------------- #
class RoadmapResource(BaseModel):
    title: str
    url: str = ""
    type: Literal["course", "article", "documentation", "video", "project"] = "article"


class RoadmapMilestone(BaseModel):
    title: str
    skill: str = ""
    estimated_weeks: int = 2
    description: str = ""
    resources: list[RoadmapResource] = Field(default_factory=list)


class Roadmap(BaseModel):
    target_role: str
    milestones: list[RoadmapMilestone] = Field(default_factory=list)
    total_weeks: int = 0


class RoadmapEvaluation(BaseModel):
    score: int = Field(0, ge=0, le=100)
    is_acceptable: bool = False
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    feedback: str = ""


# --------------------------------------------------------------------------- #
# Job matching
# --------------------------------------------------------------------------- #
class JobMatch(BaseModel):
    title: str
    company: str = ""
    location: str = ""
    url: str = ""
    match_score: int = Field(0, ge=0, le=100)
    reason: str = ""


# --------------------------------------------------------------------------- #
# API request / response
# --------------------------------------------------------------------------- #
class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    target_role: str = Field(..., min_length=2)


class AnalyzeResponse(BaseModel):
    request_id: str
    target_role: str
    resume: ParsedResume
    gap_analysis: GapAnalysis
    roadmap: Roadmap
    roadmap_evaluation: RoadmapEvaluation
    jobs: list[JobMatch] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    mock_mode: bool = False


class PipelineEvent(BaseModel):
    """Streamed progress event emitted by the orchestrator."""

    stage: str
    status: Literal["started", "completed", "error"]
    detail: str = ""
