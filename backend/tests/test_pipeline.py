"""End-to-end tests for the agent pipeline in mock mode (no API keys)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.agents.orchestrator import Orchestrator
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = """
Priya Sharma
priya.sharma@example.com

Summary: Frontend developer with 3 years of experience building web apps.

Skills: JavaScript, React, CSS, HTML, Git, REST

Experience:
Frontend Developer at Brightwave
- Built responsive React interfaces

Education:
B.Tech in Computer Science, Example University
"""


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_status_reports_mock_mode():
    body = client.get("/status").json()
    assert "integrations" in body
    assert isinstance(body["mock_mode"], bool)


def test_resume_parser_extracts_skills():
    orch = Orchestrator()
    resume = orch.parser.run(SAMPLE_RESUME)
    assert "react" in [s.lower() for s in resume.skills]
    assert resume.email == "priya.sharma@example.com"
    assert resume.years_of_experience == 3.0


def test_full_pipeline_produces_complete_response():
    body = AnalyzeBody(SAMPLE_RESUME, "Backend Engineer")
    resp = client.post("/api/analyze", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_role"] == "Backend Engineer"
    assert 0 <= data["gap_analysis"]["readiness_score"] <= 100
    assert data["roadmap"]["milestones"]
    # Every milestone in a roadmap should be grounded with resources.
    assert all(m["resources"] for m in data["roadmap"]["milestones"])
    assert 0 <= data["roadmap_evaluation"]["score"] <= 100
    assert len(data["jobs"]) > 0
    assert all(0 <= j["match_score"] <= 100 for j in data["jobs"])


def test_gap_analysis_identifies_missing_backend_skills():
    orch = Orchestrator()
    resume = orch.parser.run(SAMPLE_RESUME)
    gap = orch.gap_analyzer.run(resume, "Backend Engineer")
    missing = {g.skill for g in gap.missing_skills}
    # A frontend-only resume should be missing core backend skills.
    assert "fastapi" in missing or "python" in missing


def test_validation_rejects_short_input():
    resp = client.post(
        "/api/analyze", json={"resume_text": "too short", "target_role": "x"}
    )
    assert resp.status_code == 422


def AnalyzeBody(resume_text: str, target_role: str) -> dict:
    return {"resume_text": resume_text, "target_role": target_role}
