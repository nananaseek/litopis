# Active Context

## Current Focus

- Memory bank has been initialized; no single feature is in progress.
- Recent work (from git status) includes: theme support (ThemeContext, ThemeToggle), Layout, ToolCard, StarRating, ArsenalPage, LandingPage, ToolDetailPage, AddToolModal, and backend Dockerfile / Python version.

## Recent Changes

- Theme: ThemeContext and ThemeToggle added; Layout and pages updated for light/dark.
- Frontend: App routing, Arsenal page (tabs, filters, pagination), ToolDetailPage, AddToolModal, StarRating, ToolCard.
- Backend: Dockerfile and .python-version may have been adjusted.

## Next Steps (Suggested)

- Run full flow: auth, create tool, publish, rate, open tool detail, verify WebSocket refresh on library tab.
- Harden auth: refresh token flow, 401 handling in API client.
- Optional: tests (pytest backend, frontend unit/e2e).
- Optional: document deployment (env vars, domain, SSL).

## Active Decisions / Considerations

- UI language: Ukrainian.
- Stack: React + Vite (frontend), FastAPI + Beanie (backend), MongoDB; Docker for deployment.
- No major open decisions captured; refine as work continues.
