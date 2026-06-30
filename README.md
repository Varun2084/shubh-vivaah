# CareerAtlas 🧭

**AI-powered career planning platform.** CareerAtlas analyzes a resume,
identifies skill gaps against a target role, generates a personalized,
web-grounded learning roadmap, evaluates that roadmap's quality with an
LLM-as-judge, and recommends matching job opportunities — all through a
multi-agent pipeline.

Built with **React · Vite · FastAPI · Supabase · Pinecone · Tavily · Groq
LLMs · Gemini embeddings**.

![CI](https://github.com/Varun2084/shubh-vivaah/actions/workflows/ci.yml/badge.svg)

---

## ✨ What it does

Paste a resume **or upload a PDF / DOCX / TXT file**, pick a target role,
and CareerAtlas runs a five-stage agentic workflow:

| Stage | Agent | Output |
|-------|-------|--------|
| 1 | **Resume Parser** | Structured profile (skills, experience, education) |
| 2 | **Gap Analyzer** | Matched vs. missing skills + readiness score |
| 3 | **Roadmap Researcher** | Ordered learning roadmap grounded with Tavily web search |
| 4 | **Evaluator (LLM-as-judge)** | Quality score + one automatic refinement pass |
| 5 | **Job Matcher** | Ranked jobs via Pinecone vector similarity |

Progress streams to the UI in real time via server-sent events.

## 🏗️ Architecture

```
                ┌──────────────────────────── Orchestrator ───────────────────────────┐
  resume +      │                                                                      │
  target role → │  ResumeParser → GapAnalyzer → RoadmapResearcher → Evaluator ─┐       │ → AnalyzeResponse
                │                                      ▲           (judge)      │       │   (streamed)
                │                                      └── refine if score<70 ──┘       │
                │                                                  JobMatcher           │
                └──────────────────────────────────────────────────────────────────────┘
                       │            │              │              │            │
                     Groq        (Gemini       Tavily          Groq        Pinecone +
                     LLM         embeddings)    search          LLM         Gemini embeds
                                                                       Supabase persists runs
```

Every agent prefers its LLM/service path and **degrades gracefully to a
deterministic local implementation** when the corresponding API key is
absent — so the entire product is demonstrable end-to-end with **zero
credentials** (this is "mock mode").

```
backend/app
├── main.py                 # FastAPI app + CORS
├── config.py               # env-driven settings, per-service enable flags
├── models/schemas.py       # shared Pydantic models
├── agents/                 # resume_parser, gap_analyzer, roadmap_researcher,
│                           #   evaluator, job_matcher, orchestrator
├── services/               # llm (Groq), embeddings (Gemini), search (Tavily),
│                           #   vector_store (Pinecone), database (Supabase)
└── routers/                # /api/analyze, /api/analyze/stream, /status, /health

frontend/src
├── App.jsx                 # layout + state
├── api/client.js           # fetch + SSE streaming client
└── components/             # ResumeForm, PipelineProgress, Results
```

## 🚀 Getting started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # optional — fill in keys, or leave blank for mock mode
uvicorn app.main:app --reload # http://localhost:8000  (docs at /docs)
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxies /api to :8000)
```

Open http://localhost:5173, click **Use sample resume**, and **Analyze**.

### 🐳 Docker (whole stack)

Run both services with one command — no local Python/Node needed:

```bash
docker compose up --build
```

- Frontend (nginx): http://localhost:5173 — proxies `/api` to the backend
- Backend (FastAPI): http://localhost:8000 — docs at `/docs`

API keys are optional; drop them in `backend/.env` (the compose file loads it
if present) or run keyless in mock mode.

## 🔌 Configuration

All keys are optional. Set what you have in `backend/.env`; everything else
falls back to a working local implementation.

| Variable | Service | Used by |
|----------|---------|---------|
| `GROQ_API_KEY` | Groq LLMs | every agent's reasoning |
| `GEMINI_API_KEY` | Gemini | text embeddings |
| `TAVILY_API_KEY` | Tavily | roadmap resource grounding |
| `PINECONE_API_KEY` | Pinecone | job vector store |
| `SUPABASE_URL` / `SUPABASE_KEY` | Supabase | persisting analysis runs |

Check live integration status any time at `GET /status`.

## 🧪 Tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

The suite exercises the full pipeline in mock mode (no network required).

## 📡 API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/extract` | Extract text from an uploaded resume (PDF / DOCX / TXT / MD) |
| `POST` | `/api/analyze` | Run the full pipeline, return the result |
| `POST` | `/api/analyze/stream` | Same, streamed as SSE progress events |
| `GET`  | `/api/history` | Recent analysis runs |
| `GET`  | `/status` | Which integrations are live vs. mock |
| `GET`  | `/health` | Liveness probe |

Request body:

```json
{ "resume_text": "…", "target_role": "Backend Engineer" }
```
