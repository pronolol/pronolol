FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

RUN npm i

COPY . .

RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Build the database package
WORKDIR /app/packages/database
RUN npm run build

WORKDIR /app/apps/api
RUN npm run build

FROM node:20-bookworm AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy built api
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

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

# Install api dependencies
WORKDIR /app/apps/api
RUN npm install --omit=dev

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
