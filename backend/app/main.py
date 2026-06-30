"""CareerAtlas FastAPI application entrypoint."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import career, health

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "AI-powered career planning platform. A multi-agent pipeline parses "
        "resumes, analyses skill gaps, researches grounded learning roadmaps, "
        "evaluates roadmap quality, and recommends jobs."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(career.router)


@app.get("/")
def root() -> dict:
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "health": "/health",
        "status": "/status",
    }
