FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/scraper/package*.json ./apps/scraper/
COPY packages/database/package*.json ./packages/database/

RUN npm i

COPY . .

RUN npx prisma generate  --schema=./packages/database/prisma/schema.prisma

WORKDIR /app/apps/scraper
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.49.0-jammy AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/scraper/dist ./apps/scraper/dist
COPY --from=builder /app/packages/database/prisma ./app/packages/database/prisma
COPY --from=builder /app/packages/database/generated/prisma ./app/packages/database/generated/prisma

RUN npm install playwright dotenv pg @prisma/client

RUN npx playwright install chromium

# The command to run the scraper
CMD ["node", "apps/scraper/dist/index.mjs"]
