# syntax=docker/dockerfile:1
# ===============================
# Scraper Service Dockerfile
# ===============================
# Build: docker build -f apps/scraper/Dockerfile -t pronolol-scraper .
# Run:   docker run --env-file .env pronolol-scraper

# -----------------------------------------------
# Stage 1: Builder
# -----------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/scraper/package*.json ./apps/scraper/
COPY packages/database ./packages/database

RUN --mount=type=cache,target=/root/.npm npm install
COPY apps/scraper ./apps/scraper

RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/scraper
RUN npm run build

# -----------------------------------------------
# Stage 2: Production Runtime (Playwright image has Node + browsers pre-installed)
# -----------------------------------------------
FROM mcr.microsoft.com/playwright:v1.58.2-jammy AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY apps/scraper/package.json ./

RUN --mount=type=secret,id=npm_token \
    --mount=type=cache,target=/root/.npm \
    printf "@pronolol:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n" "$(cat /run/secrets/npm_token)" > .npmrc \
    && npm install --omit=dev \
    && rm .npmrc

COPY --from=builder /app/apps/scraper/dist ./dist

CMD ["node", "dist/index.js"]
