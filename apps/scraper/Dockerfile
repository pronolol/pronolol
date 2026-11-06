# syntax=docker/dockerfile:1
# ===============================
# Scraper Service Dockerfile
# ===============================
# Build: docker build -f apps/scraper/Dockerfile -t pronolol-scraper .
# Run:   docker run --env-file .env pronolol-scraper
#
# @pronolol/database is built from the local workspace (packages/database),
# never pulled from a registry, so the scraper always ships with the same
# schema the migrator applies. All installs use the root package-lock.json.

# -----------------------------------------------
# Stage 1: Builder (all deps, compiles database + scraper)
# -----------------------------------------------
FROM node:24-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/scraper/package.json ./apps/scraper/
COPY packages/database ./packages/database

# Root `prepare` runs husky (a root devDependency that is not installed here).
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,target=/root/.npm \
    npm ci -w @pronolol/database -w @pronolol/scraper --no-audit --no-fund

COPY apps/scraper ./apps/scraper

RUN npm run generate -w @pronolol/database \
    && npm run build -w @pronolol/database \
    && npm run build -w @pronolol/scraper

# -----------------------------------------------
# Stage 2: Production dependencies only
# -----------------------------------------------
FROM node:24-bookworm AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/scraper/package.json ./apps/scraper/
COPY packages/database/package.json ./packages/database/

# npm runs workspace `prepare` scripts even with --ignore-scripts, and the
# database one needs dev tools (prisma CLI, tsup). Its output comes from the
# builder stage instead.
RUN npm pkg delete scripts.prepare \
    && npm pkg delete scripts.prepare -w @pronolol/database
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts -w @pronolol/database -w @pronolol/scraper --no-audit --no-fund

# -----------------------------------------------
# Stage 3: Production Runtime (Playwright image has Node + browsers pre-installed)
# The image tag must match the `playwright` version in package-lock.json
# (apps/scraper/node_modules/playwright).
# -----------------------------------------------
FROM mcr.microsoft.com/playwright:v1.63.0-jammy AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Keep the workspace layout: the scraper's playwright@1.63 is nested under
# apps/scraper/node_modules (the root one is the web app's older version), and
# node_modules/@pronolol/database -> packages/database must resolve.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/scraper/node_modules ./apps/scraper/node_modules
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/apps/scraper/package.json ./apps/scraper/
COPY --from=builder /app/apps/scraper/dist ./apps/scraper/dist

WORKDIR /app/apps/scraper

CMD ["node", "dist/index.js"]
