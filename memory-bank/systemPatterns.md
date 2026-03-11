# System Patterns

## Architecture

- **Frontend**: React SPA (Vite), React Router, Axios for API, WebSocket client for real-time events.
- **Backend**: FastAPI, Beanie (ODM for MongoDB), JWT auth, optional rate limiting (SlowAPI).
- **Data**: MongoDB — collections `users`, `tools`, `tool_ratings`; tools linked to `owner_id`; ratings unique per (tool_id, user_id).

## Key Technical Decisions

- **Auth**: JWT access + refresh tokens; `get_current_user` / `get_current_user_optional` in FastAPI deps; AuthContext on frontend.
- **Tools**: Owned by user; `is_published` controls visibility in library; README fetched from GitHub API when `github_url` is set.
- **Ratings**: Stored in `ToolRating`; on set/delete, backend recalculates `average_rating` and `rating_count` on the Tool document.
- **Real-time**: Backend broadcasts a simple event (e.g. "library_changed") via WebSocket; frontend subscribes when on Library tab and refetches list on message.
- **Theme**: ThemeContext wraps app; value in localStorage; ThemeToggle in layout.

## Design Patterns

- **API versioning**: `/api/v1` prefix; routers for auth, tools, ws.
- **Schemas**: Pydantic for request/response (ToolCreate, ToolResponse, ToolDetailResponse, ToolRatingSet, etc.).
- **Errors**: HTTPException with appropriate status codes; CORS and exception handlers configured in FastAPI.
- **Frontend**: Page-level data fetching (ArsenalPage, ToolDetailPage); hooks like `useToolsWS` for WebSocket; shared API client (Axios instance with interceptors).

## Component Relationships

- **App** → ThemeProvider → AuthProvider → Routes (Landing, Login, Register, ProtectedRoute with Layout).
- **Layout**: Sidebar/nav + ThemeToggle; outlet for ArsenalPage, ToolDetailPage.
- **ArsenalPage**: Tabs (my / library), filters, AddToolModal, grid of ToolCards, pagination.
- **ToolDetailPage**: Tool info, README block, StarRating; calls API for get/rate.
- **API client**: Base URL from env; interceptors for 401 (e.g. redirect to login or refresh).
