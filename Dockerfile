FROM node:20-alpine

WORKDIR /app

# Install OpenSSL 1.1 for Prisma
RUN apk add --no-cache openssl1.1-compat || apk add --no-cache openssl

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .
COPY src/public ./public

# Generate Prisma client
RUN pnpm run prisma

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["pnpm", "start"]
