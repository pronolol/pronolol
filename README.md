# Pronolol Backend

A monorepo for the Pronolol esports prediction platform.

## 📁 Project Structure

```
├── apps/
│   ├── api/        # Express.js REST API
│   ├── mobile/     # Expo React Native app
│   └── scraper/    # Playwright web scraper
├── packages/
│   └── database/   # Prisma schema & client
├── docker/         # Shared Docker configurations
├── compose.yml     # Production Docker Compose
└── compose.dev.yml # Development overrides
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) 20+ (for local development)

### Setup

```bash
# 1. Clone and setup environment
cp .env.example .env

# 2. Edit .env with your configuration
# Required: BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)

# 3. Start all services
docker compose up -d

# Or use Make commands
make setup   # Creates .env from template
make prod    # Starts production stack
```

## 🐳 Docker Commands

### Using Make (Recommended)

```bash
make help          # Show all available commands

# Development
make dev           # Start with hot reload
make dev-tools     # Start with pgAdmin GUI

# Production
make prod          # Start production stack
make down          # Stop all services

# Logs
make logs          # Follow all logs
make logs-api      # Follow API logs only

# Database
make migrate       # Run migrations
make shell-db      # Open psql shell
make db-backup     # Create backup
```

### Using Docker Compose Directly

```bash
# Production
docker compose up -d              # Start all services (detached)
docker compose up -d db api       # Start specific services
docker compose logs -f api        # Follow API logs

# Development (with hot reload)
docker compose -f compose.yml -f compose.dev.yml up

# Operations
docker compose down               # Stop all
docker compose down -v            # Stop and remove volumes
docker compose build --no-cache   # Rebuild from scratch
```

## 🔧 Services

| Service    | Port | Description                                |
| ---------- | ---- | ------------------------------------------ |
| `db`       | 5432 | PostgreSQL database                        |
| `api`      | 3000 | Express REST API                           |
| `migrator` | -    | Runs Prisma migrations (one-shot)          |
| `scraper`  | -    | Scrapes match data (one-shot)              |
| `pgadmin`  | 5050 | Database GUI (dev only, `--profile tools`) |

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                | Required | Description                             |
| ----------------------- | -------- | --------------------------------------- |
| `POSTGRES_USER`         | No       | Database user (default: `user`)         |
| `POSTGRES_PASSWORD`     | No       | Database password (default: `password`) |
| `POSTGRES_DB`           | No       | Database name (default: `pronolol`)     |
| `BETTER_AUTH_SECRET`    | **Yes**  | Auth token signing key                  |
| `BETTER_AUTH_URL`       | No       | API base URL for auth callbacks         |
| `DISCORD_CLIENT_ID`     | No       | Discord OAuth client ID                 |
| `DISCORD_CLIENT_SECRET` | No       | Discord OAuth secret                    |

## 📱 Mobile App

The mobile app runs separately with Expo:

```bash
cd apps/mobile
npm install
npm run start
```

Configure `EXPO_PUBLIC_API_URL` in the mobile app's environment to point to your API.

## 🧪 Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker)
docker compose up -d db

# Run migrations
cd packages/database && npx prisma migrate dev

# Start API (with hot reload)
cd apps/api && npm run dev

# Start Mobile
cd apps/mobile && npm run start
```

## 📦 Building Images Individually

```bash
# API
docker build -f apps/api/Dockerfile -t pronolol-api .

# Scraper
docker build -f apps/scraper/Dockerfile -t pronolol-scraper .

# Migrator
docker build -f packages/database/Dockerfile -t pronolol-migrator .
```
