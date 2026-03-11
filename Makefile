COMPOSE_DEV  = -f docker-compose.dev.yml
COMPOSE_PROD = -f docker-compose.prod.yml

.PHONY: dev build up down logs restart clean backend-shell frontend-shell mongo-shell lint prod prod-backend prod-frontend help
.PHONY: prod-docker-up prod-docker-down prod-docker-logs prod-docker-build prod-reload

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ── Docker (dev) ───────────────────────────────────────────────

dev: ## Start dev stack: MongoDB + backend + frontend (no nginx/acme)
	docker compose $(COMPOSE_DEV) up --build

build: ## Build dev images
	docker compose $(COMPOSE_DEV) build

up: ## Start dev stack detached
	docker compose $(COMPOSE_DEV) up -d --build

down: ## Stop dev stack
	docker compose $(COMPOSE_DEV) down

restart: ## Restart dev services
	docker compose $(COMPOSE_DEV) restart

logs: ## Tail logs (dev stack)
	docker compose $(COMPOSE_DEV) logs -f

clean: ## Stop dev, remove volumes and images
	docker compose $(COMPOSE_DEV) down -v --rmi local

# ── Docker (prod: nginx + acme) ────────────────────────────────

prod-docker-up: ## Start production stack (nginx, acme, mongo, backend, frontend)
	docker compose $(COMPOSE_PROD) up -d --build

prod-docker-down: ## Stop production stack
	docker compose $(COMPOSE_PROD) down

prod-docker-logs: ## Tail production logs
	docker compose $(COMPOSE_PROD) logs -f

prod-docker-build: ## Build production images
	docker compose $(COMPOSE_PROD) build

prod-reload: ## Rebuild and restart backend + frontend (prod stack)
	docker compose $(COMPOSE_PROD) up -d --build --force-recreate backend frontend

# ── Shells (dev stack) ─────────────────────────────────────────

backend-shell: ## Open shell in backend container (dev)
	docker compose $(COMPOSE_DEV) exec backend bash || docker compose $(COMPOSE_DEV) exec backend sh

frontend-shell: ## Open shell in frontend container (dev)
	docker compose $(COMPOSE_DEV) exec frontend sh

mongo-shell: ## Open MongoDB shell (dev)
	docker compose $(COMPOSE_DEV) exec mongodb mongosh litopis

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
