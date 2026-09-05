# syntax=docker/dockerfile:1
# ===============================
# API Service Dockerfile
# ===============================
# Build: docker build -f apps/api/Dockerfile -t pronolol-api .
# Run:   docker run -p 3000:3000 --env-file .env pronolol-api

# -----------------------------------------------
# Stage 1: Builder
# -----------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database ./packages/database

RUN --mount=type=cache,target=/root/.npm npm install

COPY apps/api ./apps/api

RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/api
RUN npm run build

# -----------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update -y && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

CMD ["node", "dist/index.js"]
