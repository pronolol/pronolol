FROM node:20-bookworm-slim
WORKDIR /app

# Install openssl for the Prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install Prisma CLI globally


# Copy ONLY the prisma directory (contains schema.prisma and migrations/)
COPY packages/database/package*.json ./
COPY packages/database/prisma ./prisma
COPY packages/database/prisma.config.ts ./

RUN npm install
RUN npm install -g prisma

# We execute from /app, so the schema is at ./prisma/schema.prisma
# We don't need to copy package.json or prisma.config.ts
CMD ["prisma", "migrate", "deploy", "--schema=./prisma/schema.prisma"]
