# Project Brief: Litopis (Літопис)

## Overview

**Litopis** is a full-stack web application for managing a personal and shared **arsenal of tools** — a catalog of software tools (OSINT, analytics, communications, security, monitoring) with ratings, descriptions, and links. The UI is in Ukrainian.

## Core Requirements

- **User authentication**: Register, login, JWT-based sessions (access + refresh tokens).
- **Tools (інструменти)**:
  - CRUD for tools owned by the user (name, description, category, icon, tags, license, GitHub/official/download URLs).
  - Publish/unpublish tools to a shared **library** visible to all users.
  - Star ratings (1–5) for tools; one rating per user per tool; aggregated `average_rating` and `rating_count` on each tool.
- **Arsenal page**: Two tabs — "My tools" (власні) and "Library" (бібліотека). Filters: category, search, min rating; sort; pagination.
- **Tool detail page**: Full tool info, README (fetched from GitHub when available), rating widget.
- **Real-time updates**: WebSocket notifications when the library changes so the client can refresh the list.
- **Theme**: Light/dark mode with persistence (e.g. ThemeContext + ThemeToggle).
- **Deployment**: Docker Compose (nginx-proxy, acme-companion, MongoDB, backend, frontend); optional local dev without Docker (Makefile targets).

## Goals

- Single source of truth for project scope and high-level features.
- Clear boundaries: backend API (FastAPI + Beanie), frontend SPA (React + Vite), Ukrainian UX.
