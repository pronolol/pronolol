# ===============================
# API Service Dockerfile
# ===============================
# Multi-stage build for the Express API server
#
# Build: docker build -f apps/api/Dockerfile -t pronolol-api .
# Run:   docker run -p 3000:3000 --env-file .env pronolol-api

# -----------------------------------------------
# Stage 1: Builder
# -----------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Install all dependencies
RUN npm install

# Fix Rollup native binaries for current platform (ARM64/x64 Linux)
# This removes any cached incorrect binaries and reinstalls the correct ones
RUN rm -rf node_modules/@rollup/rollup-* && npm install @rollup/rollup-linux-arm64-gnu @rollup/rollup-linux-x64-gnu --save-optional --force || true

# Copy source files (excluding node_modules via .dockerignore)
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Generate Prisma client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build the database package
WORKDIR /app/packages/database
RUN npm run build

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# -----------------------------------------------
# Stage 2: Production Runtime
# -----------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy database package (built + generated Prisma client)
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/generated ./packages/database/generated

# Create root package.json for workspace resolution
RUN echo '{"name":"pronolol-runtime","private":true,"workspaces":["packages/*","apps/*"]}' > package.json

# Install production dependencies
WORKDIR /app/packages/database
RUN npm install --omit=dev

WORKDIR /app/apps/api
RUN npm install --omit=dev

WORKDIR /app/apps/api

# Expose default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Run the API
CMD ["node", "dist/index.js"]
