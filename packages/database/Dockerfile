# syntax=docker/dockerfile:1
# ===============================
# Database Migrator Dockerfile
# ===============================
# Lightweight container for running Prisma migrations
#
# Build: docker build -f packages/database/Dockerfile -t pronolol-migrator .
# Run:   docker run --env-file .env pronolol-migrator

FROM node:24-bookworm-slim
WORKDIR /app

# Install OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install from the root lockfile so the Prisma CLI version is pinned
COPY package.json package-lock.json ./
COPY packages/database/package.json ./packages/database/

# Skip `prepare` scripts (husky at root, generate+build in database): only the
# Prisma CLI is needed to apply migrations. Dependency install scripts still
# run so Prisma fetches its engines at build time, not on every container start.
RUN npm pkg delete scripts.prepare \
    && npm pkg delete scripts.prepare -w @pronolol/database
RUN --mount=type=cache,target=/root/.npm \
    npm ci -w @pronolol/database --no-audit --no-fund

COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/prisma.config.ts ./packages/database/

WORKDIR /app/packages/database

# Run migrations on startup
CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]
