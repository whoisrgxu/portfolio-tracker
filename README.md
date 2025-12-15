# Financial Portfolio Tracker

Full-stack portfolio dashboard with live quotes, analytics, and a Gemini-powered assistant. This repo is a pnpm workspace with a React/Vite frontend and a FastAPI backend.

## Project structure
- `apps/web`: React + Vite UI (Shadcn/Radix UI, Supabase auth).
- `apps/api`: FastAPI backend (quotes, Finnhub streaming bridge, AlphaVantage analytics, Gemini chat).
- `packages/shared`: Generated API types from the backend OpenAPI spec.

## Prerequisites
- Node 18+ and `pnpm`
- Python 3.11+ and `pip`
- API keys: Finnhub, AlphaVantage, Google Gemini, Supabase (anon/public)

## Install
```bash
# from repo root
pnpm install

# Python env for FastAPI
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn[standard] websockets sqlalchemy pandas requests finnhub-python python-dotenv google-genai
```

## Environment
Create `apps/api/.env`:
```
DATABASE_URL=sqlite:///./portfolio.db   # or your DB URI
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_key
# optional
GEMINI_MODEL=gemini-2.5-flash
```

Create `apps/web/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run (dev)
```bash
# Backend
cd apps/api
uvicorn main:app --reload --port 8000

# Frontend (from repo root)
pnpm --filter @app/web dev
# opens http://localhost:5173
```

## API tooling
- Generate OpenAPI spec: `pnpm api:spec` (API must be running on :8000)
- Generate TypeScript types: `pnpm api:gen` (writes `packages/shared/api-types.ts`)

## Features
- Live quotes via Finnhub WebSocket bridge (needs `FINNHUB_API_KEY`)
- Historical analytics via AlphaVantage + pandas
- Gemini chatbot using `google.genai` (`GEMINI_API_KEY`, optional `GEMINI_MODEL`)
- Supabase auth driven by `VITE_SUPABASE_*`

## Troubleshooting
- Chatbot issues: verify Gemini env vars and backend logs.
- Streaming issues: check `FINNHUB_API_KEY` and network access.
- Type generation: ensure the API server is running before `pnpm api:spec`/`pnpm api:gen`.
