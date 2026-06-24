# Stage 1: Build Frontend
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime Environment
FROM ubuntu:24.04 AS runner
WORKDIR /app

# Install Node.js 20 from NodeSource (Ubuntu 24.04 has GLIBC 2.39 which satisfies SQLite3 GLIBC 2.38 requirement)
RUN apt-get update && apt-get install -y curl ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and build assets
COPY api ./api
COPY database.sql ./
COPY --from=builder /app/dist ./dist

# SQLite database file directory setup
RUN mkdir -p /app/data
ENV DATABASE_PATH=/app/data/database.sqlite
VOLUME /app/data

EXPOSE 5000

CMD ["node", "api/server.js"]
