# ===============================
# Scraper Service Dockerfile
# ===============================
# Multi-stage build for the Playwright scraper
#
# Build: docker build -f apps/scraper/Dockerfile -t pronolol-scraper .
# Run:   docker run --env-file .env pronolol-scraper

# -----------------------------------------------
# Stage 1: Builder
# -----------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/scraper/package*.json ./apps/scraper/
COPY packages/database/package*.json ./packages/database/

# Install all dependencies
RUN npm install

# Fix Rollup native binaries for current platform (ARM64/x64 Linux)
# This removes any cached incorrect binaries and reinstalls the correct ones
RUN rm -rf node_modules/@rollup/rollup-* && npm install @rollup/rollup-linux-arm64-gnu @rollup/rollup-linux-x64-gnu --save-optional --force || true

# Copy source files (excluding node_modules via .dockerignore)
COPY packages/database ./packages/database
COPY apps/scraper ./apps/scraper

# Generate Prisma client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build the database package
WORKDIR /app/packages/database
RUN npm run build

# Build the scraper
WORKDIR /app/apps/scraper
RUN npm run build

# -----------------------------------------------
# Stage 2: Production Runtime with Playwright
# -----------------------------------------------
FROM mcr.microsoft.com/playwright:v1.50.0-jammy AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy built scraper
COPY --from=builder /app/apps/scraper/dist ./apps/scraper/dist
COPY --from=builder /app/apps/scraper/package.json ./apps/scraper/package.json

# Copy database package (built + generated Prisma client)
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/generated ./packages/database/generated

# Create root package.json for workspace resolution
RUN echo '{"name":"pronolol-runtime","private":true,"workspaces":["packages/*","apps/*"]}' > package.json

# Install production dependencies
WORKDIR /app/packages/database
RUN npm install --omit=dev

WORKDIR /app/apps/scraper
RUN npm install --omit=dev

# Install Chromium for Playwright
WORKDIR /app
RUN npx playwright install chromium

# Run the scraper
CMD ["node", "apps/scraper/dist/index.mjs"]
