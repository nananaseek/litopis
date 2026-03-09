.PHONY: dev build up down logs restart clean backend-shell frontend-shell mongo-shell lint prod prod-backend prod-frontend help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Docker ────────────────────────────────────────────────────

dev: ## Start all services in dev mode (with logs)
	docker compose up --build

build: ## Build production images
	docker compose build

up: ## Start all services (detached)
	docker compose up -d --build

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Tail logs for all services
	docker compose logs -f

clean: ## Stop services, remove volumes and images
	docker compose down -v --rmi local

# ── Shells ────────────────────────────────────────────────────

backend-shell: ## Open shell in backend container
	docker compose exec backend bash || docker compose exec backend sh

frontend-shell: ## Open shell in frontend container
	docker compose exec frontend sh

mongo-shell: ## Open MongoDB shell
	docker compose exec mongodb mongosh litopis

# ── Production (без Docker) ────────────────────────────────────

prod-backend: ## Run backend in production (uvicorn, no reload). Потрібен запущений MongoDB.
	cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

prod-frontend: ## Build frontend and serve (vite preview)
	cd frontend && bun run build && bun run preview

prod: ## Run backend in prod. Для повного стеку в іншому терміналі: make prod-frontend
	$(MAKE) prod-backend

# ── Local Development ─────────────────────────────────────────

backend-dev: ## Run backend locally (requires uv + MongoDB)
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev: ## Run frontend locally (requires bun)
	cd frontend && bun run dev

install-backend: ## Install backend dependencies with uv
	cd backend && uv sync

install-frontend: ## Install frontend dependencies with bun
	cd frontend && bun install

# ── Quality ───────────────────────────────────────────────────

lint: ## Lint backend (ruff) and frontend (eslint)
	cd backend && uv run ruff check app/
	cd frontend && bun run lint

format: ## Format backend code
	cd backend && uv run ruff format app/
