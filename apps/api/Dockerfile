# syntax=docker/dockerfile:1
# ===============================
# API Service Dockerfile
# ===============================
# Build: docker build -f apps/api/Dockerfile -t pronolol-api .
# Run:   docker run -p 3000:3000 --env-file .env pronolol-api
#
# @pronolol/database is built from the local workspace (packages/database),
# never pulled from a registry, so the API always ships with the same schema
# the migrator applies. All installs use the root package-lock.json.

# -----------------------------------------------
# Stage 1: Builder (all deps, compiles database + api)
# -----------------------------------------------
FROM node:24-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database ./packages/database

# Root `prepare` runs husky (a root devDependency that is not installed here).
RUN npm pkg delete scripts.prepare
RUN --mount=type=cache,target=/root/.npm \
    npm ci -w @pronolol/database -w @pronolol/api --no-audit --no-fund

COPY apps/api ./apps/api

RUN npm run generate -w @pronolol/database \
    && npm run build -w @pronolol/database \
    && npm run build -w @pronolol/api

# -----------------------------------------------
# Stage 2: Production dependencies only
# -----------------------------------------------
FROM node:24-bookworm AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# npm runs workspace `prepare` scripts even with --ignore-scripts, and the
# database one needs dev tools (prisma CLI, tsup). Its output comes from the
# builder stage instead.
RUN npm pkg delete scripts.prepare \
    && npm pkg delete scripts.prepare -w @pronolol/database
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts -w @pronolol/database -w @pronolol/api --no-audit --no-fund

# -----------------------------------------------
# Stage 3: Production Runtime
# -----------------------------------------------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update -y && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Keep the workspace layout so node_modules/@pronolol/database -> packages/database resolves.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

CMD ["node", "dist/index.js"]
