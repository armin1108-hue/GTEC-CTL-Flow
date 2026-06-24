# Stage 1: Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime Environment
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
# Install only production dependencies (this keeps sqlite3 but excludes ts/vite dev deps)
RUN npm ci --omit=dev

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
