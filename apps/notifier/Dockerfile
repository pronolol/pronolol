# syntax=docker/dockerfile:1
# ===============================
# Notifier Service Dockerfile
# ===============================
# Build: docker build -f apps/notifier/Dockerfile -t pronolol-notifier .
# Run:   docker run --env-file .env pronolol-notifier

# -----------------------------------------------
# Stage 1: Builder
# -----------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/notifier/package*.json ./apps/notifier/
COPY packages/database ./packages/database

RUN --mount=type=cache,target=/root/.npm npm install

COPY apps/notifier ./apps/notifier

RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/notifier
RUN npm run build

# -----------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY apps/notifier/package.json ./

RUN --mount=type=secret,id=npm_token \
    --mount=type=cache,target=/root/.npm \
    printf "@pronolol:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n" "$(cat /run/secrets/npm_token)" > .npmrc \
    && npm install --omit=dev \
    && rm .npmrc

COPY --from=builder /app/apps/notifier/dist ./dist

CMD ["node", "dist/index.js"]
