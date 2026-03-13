# Pronolol Backend

A monorepo for the Pronolol esports prediction platform.

## Project Structure

```
├── apps/
│   ├── api/        # Express.js REST API
│   ├── mobile/     # Expo React Native app
│   └── scraper/    # Playwright web scraper
├── packages/
│   └── database/   # Prisma schema & client
├── compose.yml         # Full Docker Compose (all services)
└── compose.infra.yml   # Infrastructure-only (DB + migrations)
```

## Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Setup

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — required: BETTER_AUTH_SECRET (openssl rand -base64 32)
```

### Running services

```bash
# Terminal 1 — start Postgres and run migrations automatically
npm run dev:db

# Terminal 2 — API with hot reload
npm run dev:api

# Terminal 3 — mobile
cd apps/mobile && npx expo start
```

### Stopping

```bash
npm run dev:db:down
```

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:db` | Start Postgres + run migrations (Docker) |
| `npm run dev:db:down` | Stop infrastructure containers |
| `npm run dev:api` | Start API locally with hot reload |
| `npm run dev:scraper` | Start scraper locally with hot reload |
| `npm run migrate` | Run Prisma migrations against local DB |
| `npm run build` | Build all packages (topologically ordered via Turbo) |
| `npm test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Auto-fix lint issues |

## Services

| Service    | Port | Description                                |
| ---------- | ---- | ------------------------------------------ |
| `db`       | 5432 | PostgreSQL database                        |
| `api`      | 3000 | Express REST API                           |
| `migrator` | -    | Runs Prisma migrations (one-shot)          |
| `scraper`  | -    | Scrapes match data (one-shot)              |
| `pgadmin`  | 5050 | Database GUI (`--profile tools`)           |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                | Required | Description                             |
| ----------------------- | -------- | --------------------------------------- |
| `POSTGRES_USER`         | No       | Database user (default: `user`)         |
| `POSTGRES_PASSWORD`     | No       | Database password (default: `password`) |
| `POSTGRES_DB`           | No       | Database name (default: `pronolol`)     |
| `DATABASE_URL`          | No       | Full connection string (auto-set in Docker) |
| `BETTER_AUTH_SECRET`    | **Yes**  | Auth token signing key                  |
| `BETTER_AUTH_URL`       | No       | API base URL for auth callbacks         |
| `DISCORD_CLIENT_ID`     | No       | Discord OAuth client ID                 |
| `DISCORD_CLIENT_SECRET` | No       | Discord OAuth secret                    |

## Production (Docker)

```bash
# Start all services
docker compose -f compose.yml -f compose.prod.yml up -d

# View logs
docker compose logs -f api

# Stop all
docker compose down
```

## Database Operations

```bash
# Run migrations (local dev)
npm run migrate

# Open psql shell
docker compose exec db psql -U user -d pronolol

# Backup
mkdir -p backups
docker compose exec db pg_dump -U user pronolol > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
cat backups/your_backup.sql | docker compose exec -T db psql -U user -d pronolol
```

## Building Docker Images

```bash
# API
docker build -f apps/api/Dockerfile -t pronolol-api .

# Scraper
docker build -f apps/scraper/Dockerfile -t pronolol-scraper .

# Migrator
docker build -f packages/database/Dockerfile -t pronolol-migrator .
```

## Publishing

The publish workflow requires an `NPM_TOKEN` secret configured in GitHub repository settings (Settings > Secrets > Actions). This token must have write access to the GitHub Packages registry.

## Mobile App

Configure `EXPO_PUBLIC_API_URL` in `.env` to point to your API (use your machine's local network IP for device testing, e.g. `http://192.168.1.x:3000`).
