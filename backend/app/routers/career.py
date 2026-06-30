"""Career-analysis API: run the multi-agent pipeline."""
from __future__ import annotations

import json

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.agents.orchestrator import get_orchestrator
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, PipelineEvent
from app.services.database import get_database
from app.services.extract import ExtractionError, extract_text

router = APIRouter(prefix="/api", tags=["career"])


@router.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict:
    """Extract plain text from an uploaded resume (PDF / DOCX / TXT / MD)."""
    data = await file.read()
    try:
        text = extract_text(file.filename or "", data)
    except ExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"filename": file.filename, "text": text, "characters": len(text)}


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Run the full pipeline synchronously and return the assembled result."""
    return get_orchestrator().run(request.resume_text, request.target_role)


@router.post("/analyze/stream")
def analyze_stream(request: AnalyzeRequest) -> StreamingResponse:
    """Stream pipeline progress as server-sent events, ending with the result."""

    def event_stream():
        for item in get_orchestrator().stream(request.resume_text, request.target_role):
            if isinstance(item, PipelineEvent):
                payload = {"type": "event", "data": item.model_dump()}
            else:  # final AnalyzeResponse
                payload = {"type": "result", "data": item.model_dump(mode="json")}
            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/history")
def history(limit: int = 10) -> dict:
    """Return recent analysis runs (Supabase or in-memory)."""
    return {"items": get_database().recent_analyses(limit=limit)}
