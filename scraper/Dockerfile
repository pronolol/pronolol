FROM mcr.microsoft.com/playwright:v1.49.0-jammy AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/src/app/dist ./dist

RUN npx playwright install --with-deps chromium

# The command to run the scraper
CMD ["node", "dist/index.js"]
