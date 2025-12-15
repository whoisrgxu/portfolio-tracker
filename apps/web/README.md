# Financial Portfolio Tracker

Full‑stack portfolio dashboard with live quotes, analytics, and a Gemini‑powered assistant. The repo uses a workspace layout:

- `apps/web`: React + Vite frontend (Shadcn/Radix UI, Supabase auth).
- `apps/api`: FastAPI backend (quotes, streaming via Finnhub WS, analytics via AlphaVantage, Gemini chat).
- `packages/shared`: Generated API types (via OpenAPI).

## Prerequisites
- Node 18+ and `pnpm` (workspace manager).
- Python 3.11+ with `pip`.
- API keys: Finnhub, AlphaVantage, Google Gemini, Supabase (anon/public).

## Install dependencies
```bash
# from repo root
pnpm install

# python env for FastAPI (no requirements file is checked in; install manually)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn[standard] websockets sqlalchemy pandas requests finnhub-python python-dotenv google-genai
```

## Environment variables
Create `apps/api/.env` with:
```
DATABASE_URL=sqlite:///./portfolio.db   # or your DB URI
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_key
# Optional:
GEMINI_MODEL=gemini-2.5-flash
```

Create `apps/web/.env` with:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the stack (dev)
```bash
# Backend (FastAPI)
cd apps/api
uvicorn main:app --reload --port 8000

# Frontend (Vite)
pnpm --filter @app/web dev
# opens http://localhost:5173
```

## API tooling
- Generate OpenAPI spec: `pnpm api:spec` (requires API running on :8000).
- Generate TypeScript types: `pnpm api:gen` (writes to `packages/shared/api-types.ts`).

## Features & notes
- **Live prices**: WS bridge to Finnhub; requires `FINNHUB_API_KEY`.
- **Analytics**: Historical prices via AlphaVantage (`ALPHA_VANTAGE_API_KEY`) and pandas calculations.
- **Chatbot**: Google Gemini via `google.genai` client using `GEMINI_API_KEY`; `GEMINI_MODEL` optional.
- **Auth**: Supabase client driven by `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## Troubleshooting
- Chatbot errors: verify `GEMINI_API_KEY`/`GEMINI_MODEL` and backend logs.
- Streaming not working: ensure `FINNHUB_API_KEY` and outbound network access.
- Type generation: API must be running before `pnpm api:spec` / `pnpm api:gen`.
