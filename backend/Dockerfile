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
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy built node_modules and app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Cloud Run will set PORT env var
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
