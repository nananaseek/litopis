# Progress

## What Works

- **Backend**: FastAPI app with `/api/v1` router; auth (register, login, JWT); tools CRUD, publish/unpublish, list my tools, list library with filters; ratings (set, recalc on tool); WebSocket for library events; README fetch from GitHub; health check; CORS; rate limiting.
- **Frontend**: Landing, login, register; protected routes and AuthContext; Arsenal page with "My tools" and "Library" tabs, filters (category, search, min rating), sort, pagination; AddToolModal; ToolCard; ToolDetailPage with rating; theme (light/dark) with ThemeContext and ThemeToggle; API client and WebSocket hook for library updates.
- **Dev/Deploy**: Docker Compose (nginx-proxy, acme-companion, mongodb, backend, frontend); Makefile (dev, up, down, prod-backend, prod-frontend, lint, install-*, backend-dev, frontend-dev).

## What's Left / To Build

- End-to-end validation of all flows (auth, CRUD, publish, rate, WebSocket).
- Optional: automated tests (backend pytest, frontend).
- Optional: refresh token handling and 401 retry in frontend client.
- Optional: deployment and env documentation.

## Current Status

- Core features are implemented; recent changes are uncommitted (theme, layout, pages, components, backend Dockerfile). Memory bank is initialized.

## Known Issues

- None explicitly documented; to be updated as issues are found.
