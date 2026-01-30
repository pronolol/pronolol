# ===============================
# Pronolol Makefile
# ===============================
# Quick commands for Docker operations
#
# Usage: make [command]

.PHONY: help build up down logs clean dev prod migrate scrape

# Default target
help:
	@echo "Pronolol Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Setup:"
	@echo "  make setup      - Copy .env.example to .env"
	@echo "  make build      - Build all Docker images"
	@echo ""
	@echo "Development:"
	@echo "  make dev        - Start development environment (with hot reload)"
	@echo "  make dev-tools  - Start dev + pgAdmin"
	@echo ""
	@echo "Production:"
	@echo "  make prod       - Start production environment"
	@echo "  make up         - Alias for prod"
	@echo ""
	@echo "Operations:"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - Follow logs for all services"
	@echo "  make logs-api   - Follow API logs only"
	@echo "  make migrate    - Run database migrations"
	@echo "  make scrape     - Run the scraper once"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean      - Remove containers, volumes, and images"
	@echo "  make prune      - Docker system prune (careful!)"

# ===============================
# Setup
# ===============================
setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example"; \
		echo "Please edit .env with your configuration"; \
	else \
		echo ".env already exists"; \
	fi

# ===============================
# Build
# ===============================
build:
	docker compose build

build-no-cache:
	docker compose build --no-cache

# ===============================
# Development
# ===============================
dev:
	docker compose -f compose.yml -f compose.dev.yml up

dev-tools:
	docker compose -f compose.yml -f compose.dev.yml --profile tools up

dev-build:
	docker compose -f compose.yml -f compose.dev.yml up --build

# ===============================
# Production
# ===============================
prod:
	docker compose up -d

up: prod

prod-build:
	docker compose up -d --build

# ===============================
# Operations
# ===============================
down:
	docker compose down

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-scraper:
	docker compose logs -f scraper

logs-db:
	docker compose logs -f db

# Run migrations only
migrate:
	docker compose up migrator

# Run scraper only (assumes db is running)
scrape:
	docker compose up scraper

# ===============================
# Maintenance
# ===============================
clean:
	docker compose down -v --rmi local

prune:
	docker system prune -af

# Restart a specific service
restart-api:
	docker compose restart api

restart-db:
	docker compose restart db

# Shell access
shell-api:
	docker compose exec api sh

shell-db:
	docker compose exec db psql -U $${POSTGRES_USER:-user} -d $${POSTGRES_DB:-pronolol}

# ===============================
# Database Operations
# ===============================
db-backup:
	@mkdir -p backups
	docker compose exec db pg_dump -U $${POSTGRES_USER:-user} $${POSTGRES_DB:-pronolol} > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created in backups/"

db-restore:
	@echo "Usage: cat backups/your_backup.sql | docker compose exec -T db psql -U user -d pronolol"
