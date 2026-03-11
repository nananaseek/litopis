# Product Context

## Why This Project Exists

Litopis serves as a **tool arsenal and catalog** for teams or individuals who need to:

- Keep a structured list of tools (OSINT, analytics, communications, security, monitoring).
- Share a common library of approved/published tools.
- Rate and discover tools by category, search, and minimum rating.

## Problems It Solves

- **Fragmented tool lists**: Central place for "my tools" vs "shared library".
- **Discovery**: Filter by category, search, and rating; see README and links in one place.
- **Trust**: Ratings (1–5) and aggregated stats help decide which tools to use.
- **Real-time awareness**: WebSocket events when the library changes so users see updates without manual refresh.

## How It Should Work

1. **Landing / Auth**: Anonymous users see landing; authenticated users are redirected to `/arsenal`. Login/register with JWT.
2. **Arsenal**: Two tabs — "My tools" (only own tools, full CRUD + publish/unpublish/delete) and "Library" (all published tools, read + rate). Filters and pagination apply.
3. **Tool detail**: View tool, optional README from GitHub, rate with stars; back to arsenal.
4. **Theme**: Toggle light/dark; preference persisted (e.g. localStorage).
5. **Backend**: REST API for auth and tools; WebSocket for library-change events; rate limiting (e.g. SlowAPI).

## User Experience Goals

- Ukrainian UI and copy throughout.
- Fast, responsive list and detail views.
- Clear feedback on publish/unpublish, create, delete, and rating actions.
- Accessible, readable layout (Tailwind; consider dark mode contrast).
