# Stage 1: Build Frontend
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime Environment
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
# Install build tools, install production dependencies, rebuild sqlite3 from source, then clean up
RUN apt-get update && apt-get install -y python3 make g++ \
    && npm ci --omit=dev \
    && npm rebuild sqlite3 --build-from-source \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy server code and build assets
COPY server.cjs ./
COPY database.sql ./
COPY --from=builder /app/dist ./dist

# SQLite database file directory setup
RUN mkdir -p /app/data
ENV DATABASE_PATH=/app/data/database.sqlite
VOLUME /app/data

EXPOSE 5000

CMD ["node", "server.cjs"]
