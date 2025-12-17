# Stage 1: Builder
# Use build platform to run build tools (npm, tsc) on host architecture
# Pinned to manifest list digest for security and multi-platform compatibility
# This digest references a manifest list supporting: linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6, linux/s390x
# To update: curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq -r '.digest'
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:7e0bd0460b26eb3854ea5b99b887a6a14d665d14cae694b78ae2936d14b2befb AS builder

# Build arguments for multi-platform support
ARG BUILDPLATFORM
ARG TARGETPLATFORM

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --ignore-scripts

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript code
RUN npm run build

# Verify build output exists
RUN test -f dist/index.js || (echo "Build failed: dist/index.js not found" && exit 1)

# Stage 2: Runtime
# Pinned to manifest list digest for security and multi-platform compatibility
# This digest references a manifest list supporting: linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6, linux/s390x
# Docker BuildKit automatically uses the target platform (no need for --platform=$TARGETPLATFORM)
# To update: curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq -r '.digest'
FROM node:24-alpine@sha256:7e0bd0460b26eb3854ea5b99b887a6a14d665d14cae694b78ae2936d14b2befb

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Skip postinstall scripts (lefthook is a devDependency and not needed in production)
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G mcp -g mcp mcp && \
    chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Set Node.js environment to production
ENV NODE_ENV=production

# Expose port for HTTP transport
EXPOSE 3000

# Health check - uses /health endpoint when HTTP transport is enabled
# For stdio transport, falls back to basic node check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD if [ "$TRANSPORT" = "http" ]; then \
        node -e "require('http').get('http://localhost:' + (process.env.PORT || '3000') + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; \
    else \
        node -e "console.log('OK')" || exit 1; \
    fi

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]
