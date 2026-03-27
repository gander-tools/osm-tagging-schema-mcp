# Multi-stage Dockerfile for OSM Tagging Schema MCP Server
#
# This Dockerfile supports two build modes using --target:
#
# 1. Development/PR builds (default):
#    docker build .
#    - Compiles TypeScript from source in builder stage
#    - Used for: PRs, master branch, local development
#
# 2. Release builds:
#    docker build --target release .
#    - Requires pre-built dist/ directory in build context
#    - Used for: version tag releases with NPM publish artifact
#    - Ensures Docker image contains identical code as NPM package (SLSA provenance)

# =============================================================================
# Stage 1: Builder (TypeScript compilation for development builds)
# =============================================================================
# Use build platform to run build tools (npm, tsc) on host architecture
# Pinned to manifest list digest for security and multi-platform compatibility
# This digest references a manifest list supporting: linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6, linux/s390x
# To update: curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq -r '.digest'
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS builder

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

# =============================================================================
# Stage 2: Runtime Base (shared configuration for both modes)
# =============================================================================
# Pinned to manifest list digest for security and multi-platform compatibility
# This digest references a manifest list supporting: linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6, linux/s390x
# Docker BuildKit automatically uses the target platform (no need for --platform=$TARGETPLATFORM)
# To update: curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq -r '.digest'
FROM node:24-alpine@sha256:01743339035a5c3c11a373cd7c83aeab6ed1457b55da6a69e014a95ac4e4700b AS runtime-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Skip postinstall scripts (lefthook is a devDependency and not needed in production)
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S mcp && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G mcp -g mcp mcp && \
    chown -R mcp:mcp /app

# Install sentry-cli for release management and source map uploads
COPY --from=getsentry/sentry-cli /bin/sentry-cli /usr/local/bin/sentry-cli

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

# =============================================================================
# Stage 3: Development Runtime (default - uses builder output)
# =============================================================================
FROM runtime-base AS development

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]

# =============================================================================
# Stage 4: Release Runtime (uses pre-built dist/ from NPM artifact)
# =============================================================================
FROM runtime-base AS release

# Copy pre-built dist/ directory from build context (NPM publish artifact)
# This dist/ is the same build that was published to NPM with SLSA Level 3 provenance
COPY dist/ ./dist/

# Verify that dist/index.js exists (artifact was properly copied)
RUN test -f dist/index.js || (echo "Error: dist/index.js not found - artifact not properly provided" && exit 1)

# Set entrypoint
ENTRYPOINT ["node", "dist/index.js"]
