# ===============================
# Base Builder Image
# ===============================
# This Dockerfile creates a shared builder image with:
# - All workspace dependencies installed
# - Prisma client generated
# - Database package built
#
# Used as a base for api and scraper builds to avoid duplication.

FROM node:20-bookworm AS base-builder
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/scraper/package*.json ./apps/scraper/
COPY packages/database/package*.json ./packages/database/

# Install all dependencies
RUN npm ci

# Copy source files
COPY packages/database ./packages/database
COPY apps/api ./apps/api
COPY apps/scraper ./apps/scraper
COPY tsconfig*.json ./

# Generate Prisma client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build the database package (shared dependency)
WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app
