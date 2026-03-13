# ===============================
# Database Migrator Dockerfile
# ===============================
# Lightweight container for running Prisma migrations
#
# Build: docker build -f packages/database/Dockerfile -t pronolol-migrator .
# Run:   docker run --env-file .env pronolol-migrator

FROM node:20-bookworm-slim
WORKDIR /app

# Install OpenSSL for Prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and prisma schema/migrations
COPY packages/database/package*.json ./
COPY packages/database/prisma ./prisma
COPY packages/database/prisma.config.ts ./

# Install dependencies including Prisma CLI (skip prepare script, we only need migrations)
RUN npm install --ignore-scripts

# Run migrations on startup
CMD ["npx", "prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]
