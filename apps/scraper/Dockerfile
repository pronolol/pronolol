FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/scraper/package*.json ./apps/scraper/
COPY packages/database/package*.json ./packages/database/

RUN npm i

COPY . .

RUN npx prisma generate  --schema=./packages/database/prisma/schema.prisma

# Build the database package
WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/scraper
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.50.0-jammy AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy built scraper
COPY --from=builder /app/apps/scraper/dist ./apps/scraper/dist
COPY --from=builder /app/apps/scraper/package.json ./apps/scraper/package.json

# Copy the entire database package structure
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/generated ./packages/database/generated

# Create a root package.json for workspace setup
RUN echo '{"name":"pronolol-runtime","workspaces":["packages/*","apps/*"]}' > package.json

# Install dependencies in the database package
WORKDIR /app/packages/database
RUN npm install --omit=dev

# Install scraper dependencies and playwright
WORKDIR /app/apps/scraper
RUN npm install --omit=dev

WORKDIR /app
RUN npx playwright install chromium

# The command to run the scraper
CMD ["node", "apps/scraper/dist/index.mjs"]
