# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (argon2)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies for argon2 native module
# libstdc++6 is usually pre-installed, but we ensure it's there
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy built node_modules and app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Cloud Run will set PORT env var
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Health check for debugging
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start the server
CMD ["node", "index.js"]
