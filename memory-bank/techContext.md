# Tech Context

## Technologies

| Layer     | Stack |
|----------|--------|
| Frontend | React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS 4, Axios, DOMPurify |
| Backend  | Python 3.12+, FastAPI, Beanie, Motor, Pydantic, python-jose, bcrypt, SlowAPI, httpx, uvicorn |
| Database | MongoDB 7 |
| Dev/Prod | Docker, Docker Compose; nginx-proxy + acme-companion for SSL; Makefile for commands |

## Development Setup

- **Backend**: `uv` for deps and runs (`uv run uvicorn app.main:app --reload`). Requires MongoDB (e.g. `docker compose up -d mongodb` or local MongoDB).
- **Frontend**: `bun` (or npm) for deps; `bun run dev` for Vite dev server.
- **Full stack in Docker**: `make dev` or `docker compose up --build`; backend and frontend as services behind nginx-proxy when `VIRTUAL_HOST` / `LETSENCRYPT_HOST` are set.
- **Linting**: Backend — Ruff; Frontend — ESLint. `make lint` runs both.

## Technical Constraints

- Backend uses Beanie async API; all DB access is async.
- Frontend expects API at configurable base URL (e.g. env `VITE_API_URL` or proxy in Vite).
- JWT secret and MongoDB URL must be set via env (see `.env.example`).
- Rate limiting applied at FastAPI level (SlowAPI).

## Key Files / Paths

- Backend entry: `backend/app/main.py`; router: `backend/app/api/router.py`; models: `backend/app/models/`; schemas: `backend/app/schemas/`.
- Frontend entry: `frontend/src/main.tsx`, `App.tsx`; pages: `frontend/src/pages/`; API: `frontend/src/api/`; contexts: `frontend/src/contexts/`.
- Docker: `docker-compose.yml` (nginx-proxy, acme-companion, mongodb, backend, frontend); `backend/Dockerfile`, `frontend/Dockerfile`.
- Config: `.env` from `.env.example`; `backend/app/config.py` (Pydantic settings).
