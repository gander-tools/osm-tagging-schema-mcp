# Deployment Guide

This guide covers deploying the OSM Tagging Schema MCP Server in production environments using Docker.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [HTTP Transport Deployment](#http-transport-deployment)
- [Production Deployment](#production-deployment)
- [Configuration Options](#configuration-options)
- [Health Checks](#health-checks)
- [Logging](#logging)
- [Monitoring](#monitoring)
- [Scaling](#scaling)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Overview

The OSM Tagging Schema MCP Server can be deployed as:

1. **Standalone Docker Container** - Single container deployment (covered in this guide)
2. **Kubernetes** - Scalable, production-grade orchestration (future)

This guide focuses on Docker container deployment, which is recommended for production environments.

## Build Architecture

Docker images are built using a **unified multi-stage Dockerfile** with two build targets:

**Release Builds (version tags like `v1.0.0`):**
- Use `docker build --target release` (artifact-based)
- Download pre-built `dist/` from NPM publish workflow
- **Same code as NPM package** with SLSA Level 3 attestations
- Faster builds (no TypeScript compilation)
- Complete provenance chain: Docker → dist.tar.gz → NPM package

**Development Builds (PRs, master branch, `edge` tag):**
- Use `docker build .` (default target, multi-stage build)
- Compile TypeScript from source during build
- Independent of NPM publish workflow

**Architectural Benefits:**
- Single Dockerfile for both build modes (easier maintenance)
- Shared runtime configuration (non-root user, health checks, etc.)
- Release images inherit SLSA attestations from NPM build
- Verifiable consistency between NPM and Docker distributions
- Single build artifact reduces attack surface

For more details, see [Security & Supply Chain](security.md#shared-build-artifact-provenance).

## Prerequisites

**Required:**
- Docker Engine 20.10+
- Linux, macOS, or Windows with WSL2

**Recommended:**
- 512MB RAM minimum (1GB recommended)
- 1 CPU core minimum (2 cores recommended)
- 500MB disk space

**Network Requirements:**
- Port 3000 available (or custom port)
- Outbound internet access (for schema updates)

## Quick Start

### 1. Pull the Docker Image

```bash
# Production (latest stable)
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Or for development (edge)
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:edge
```

### 2. Start the Service

```bash
# Production
docker run -d \
  --name osm-tagging-mcp \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TRANSPORT=http \
  -e LOG_LEVEL=info \
  -e NODE_ENV=production \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

### 3. Verify Health

```bash
# Check container status
docker ps | grep osm-tagging-mcp

# Check health endpoint
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "osm-tagging-schema-mcp",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Check Readiness

```bash
# Check if schema is loaded and ready
curl http://localhost:3000/ready
```

**Expected response:**
```json
{
  "status": "ready",
  "service": "osm-tagging-schema-mcp",
  "schema": {
    "presets": 1707,
    "fields": 799,
    "categories": 14,
    "version": "6.7.3"
  },
  "timestamp": "2024-01-15T10:30:05.000Z"
}
```

## HTTP Transport Deployment

The server supports HTTP transport for web clients, API integrations, and remote access.

### NPX Deployment

**Quick Start:**
```bash
# Start HTTP server on port 3000
TRANSPORT=http npx @gander-tools/osm-tagging-schema-mcp
```

**Custom Configuration:**
```bash
# Custom port and host
TRANSPORT=http PORT=8080 HOST=127.0.0.1 LOG_LEVEL=info \
  npx @gander-tools/osm-tagging-schema-mcp
```

**Using npm scripts (from source):**
```bash
npm run start:http  # Production build with HTTP transport
npm run dev:http    # Development mode with hot reload
```

### Docker HTTP Deployment

**Quick Start:**
```bash
docker run -d \
  --name osm-tagging-http \
  -p 3000:3000 \
  -e TRANSPORT=http \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

**Production Configuration:**
```bash
docker run -d \
  --name osm-tagging-http \
  --restart unless-stopped \
  -p 3000:3000 \
  -e TRANSPORT=http \
  -e PORT=3000 \
  -e LOG_LEVEL=info \
  -e NODE_ENV=production \
  --memory=512m \
  --cpus=1.0 \
  --read-only \
  --tmpfs /tmp \
  --security-opt=no-new-privileges:true \
  --health-cmd='node -e "require(\"http\").get(\"http://localhost:3000/health\", (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on(\"error\", () => process.exit(1))"' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-start-period=10s \
  --health-retries=3 \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

### HTTP Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `TRANSPORT` | `stdio`, `http` | `stdio` | Transport protocol mode |
| `PORT` | 1-65535 | `3000` | HTTP server port |
| `HOST` | IP/hostname | `0.0.0.0` | Bind address (0.0.0.0 = all interfaces) |
| `LOG_LEVEL` | `SILENT`, `ERROR`, `WARN`, `INFO`, `DEBUG` | `INFO` | Logging verbosity |
| `NODE_ENV` | `production`, `development` | - | Node.js environment |

### HTTP Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/mcp` | GET | Server-Sent Events stream for MCP messages |
| `/mcp` | POST | Send JSON-RPC messages to MCP server |
| `/mcp/:sessionId` | DELETE | Close a specific session |
| `/health` | GET | Liveness probe (server status) |
| `/ready` | GET | Readiness probe (schema loaded status) |

**Example Usage:**

```bash
# Health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/ready

# MCP protocol communication (requires MCP client library)
# See MCP documentation: https://modelcontextprotocol.io
```

### Testing HTTP Deployment

**With MCP Inspector:**
```bash
# Start server in one terminal
TRANSPORT=http npx @gander-tools/osm-tagging-schema-mcp

# Connect inspector in another terminal
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:3000
```

📖 **For detailed inspection guide**, see [Inspection Guide](../development/inspection.md)

## Production Deployment

### Deployment Steps

1. **Create deployment directory:**
   ```bash
   mkdir -p /opt/osm-tagging-mcp
   cd /opt/osm-tagging-mcp
   ```

2. **Create container with production settings:**
   ```bash
   docker run -d \
     --name osm-tagging-mcp \
     --restart unless-stopped \
     -p 3000:3000 \
     -e TRANSPORT=http \
     -e PORT=3000 \
     -e HOST=0.0.0.0 \
     -e LOG_LEVEL=info \
     -e NODE_ENV=production \
     --memory=512m \
     --cpus=1.0 \
     --read-only \
     --tmpfs /tmp \
     --security-opt=no-new-privileges:true \
     --health-cmd='node -e "require(\"http\").get(\"http://localhost:3000/health\", (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on(\"error\", () => process.exit(1))"' \
     --health-interval=30s \
     --health-timeout=10s \
     --health-start-period=10s \
     --health-retries=3 \
     ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
   ```

3. **Verify deployment:**
   ```bash
   # Check logs
   docker logs -f osm-tagging-mcp

   # Check health
   curl http://localhost:3000/health
   curl http://localhost:3000/ready
   ```

4. **Enable on system startup:**
   ```bash
   # Container will restart automatically with --restart unless-stopped
   # Ensure Docker service starts on boot:
   sudo systemctl enable docker
   ```

### Production Checklist

- [ ] Resource limits configured appropriately
- [ ] Health checks responding correctly
- [ ] Logs being captured (Docker logs or log aggregation)
- [ ] Monitoring in place (see [Monitoring](#monitoring))
- [ ] Backups not needed (stateless service)
- [ ] Network security configured (firewall, reverse proxy)
- [ ] SSL/TLS configured (if exposing publicly)

## Configuration Options

### Environment Variables

Set environment variables using `-e` flag:

```bash
docker run -d \
  -e TRANSPORT=http \        # Options: stdio, http
  -e PORT=3000 \              # HTTP port (default: 3000)
  -e HOST=0.0.0.0 \           # Bind address (default: 0.0.0.0)
  -e LOG_LEVEL=info \         # Options: debug, info, warn, error
  -e NODE_ENV=production \    # Options: production, development
  ...
```

### Port Mapping

Change the host port (left side) while keeping container port (right side):

```bash
docker run -d \
  -p 8080:3000 \  # Expose on host port 8080
  ...
```

### Resource Limits

Adjust based on your workload:

```bash
docker run -d \
  --memory=1g \       # Maximum memory
  --memory-reservation=512m \  # Reserved memory
  --cpus=2.0 \        # Maximum CPU cores
  --cpu-shares=1024 \ # CPU share weight
  ...
```

**Guidelines:**
- **Minimum**: 256MB RAM, 0.5 CPU cores
- **Recommended**: 512MB RAM, 1 CPU core
- **Heavy load**: 1GB RAM, 2 CPU cores

### Security Options

Production security settings:

```bash
docker run -d \
  --read-only \                           # Read-only root filesystem
  --tmpfs /tmp \                          # Writable /tmp in memory
  --security-opt=no-new-privileges:true \ # Prevent privilege escalation
  --cap-drop=ALL \                        # Drop all capabilities
  ...
```

## Health Checks

The server provides two health check endpoints:

### Liveness Probe - `/health`

**Purpose**: Check if the server is running

**Usage:**
```bash
curl http://localhost:3000/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "osm-tagging-schema-mcp",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Use cases:**
- Docker health checks
- Load balancer health checks
- Monitoring alerts

### Readiness Probe - `/ready`

**Purpose**: Check if the server is ready to handle requests (schema loaded)

**Usage:**
```bash
curl http://localhost:3000/ready
```

**Response (200 OK):**
```json
{
  "status": "ready",
  "service": "osm-tagging-schema-mcp",
  "schema": {
    "presets": 1707,
    "fields": 799,
    "categories": 14,
    "version": "6.7.3"
  },
  "timestamp": "2024-01-15T10:30:05.000Z"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "not_ready",
  "error": "Schema not loaded",
  "timestamp": "2024-01-15T10:30:01.000Z"
}
```

**Use cases:**
- Kubernetes readiness probes
- Load balancer backend health
- Deployment verification

### Docker Health Check

Configure health check when starting container:

```bash
docker run -d \
  --health-cmd='node -e "require(\"http\").get(\"http://localhost:3000/health\", (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on(\"error\", () => process.exit(1))"' \
  --health-interval=30s \
  --health-timeout=10s \
  --health-start-period=10s \
  --health-retries=3 \
  ...
```

**Check health status:**
```bash
# Check container health
docker ps
# Look for "healthy" status

# Inspect health details
docker inspect osm-tagging-mcp --format='{{.State.Health.Status}}'
# Output: healthy
```

## Logging

### Log Levels

The server supports configurable logging via the `LOG_LEVEL` environment variable:

| Level | Output | Use Case |
|-------|--------|----------|
| `SILENT` | No logs | Not recommended (debugging issues impossible) |
| `ERROR` | Errors only | Minimal production logging |
| `WARN` | Errors + warnings | **Recommended for production** |
| `INFO` | Errors + warnings + info | Troubleshooting, staging environments |
| `DEBUG` | All messages including debug | Development only |

**Examples:**

```bash
# NPX with different log levels
LOG_LEVEL=WARN npx @gander-tools/osm-tagging-schema-mcp
LOG_LEVEL=DEBUG npx tsx src/index.ts

# Docker with log level
docker run -d \
  -e LOG_LEVEL=warn \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

### Viewing Logs

**Docker Logs:**
```bash
# Follow logs in real-time
docker logs -f osm-tagging-mcp

# View last 100 lines
docker logs --tail=100 osm-tagging-mcp

# View logs with timestamps
docker logs -t osm-tagging-mcp

# Filter by log level
docker logs osm-tagging-mcp 2>&1 | grep ERROR
docker logs osm-tagging-mcp 2>&1 | grep WARN
```

**NPX/Source Logs:**
```bash
# Logs go to stderr by default (doesn't interfere with MCP stdio)
TRANSPORT=http LOG_LEVEL=info npx @gander-tools/osm-tagging-schema-mcp 2> server.log
```

### Log Rotation

**Docker Logging Drivers:**

```bash
# JSON file with rotation
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Syslog forwarding
docker run -d \
  --log-driver syslog \
  --log-opt syslog-address=tcp://192.168.0.42:514 \
  --log-opt tag="osm-tagging-mcp" \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

## Monitoring

### Container Stats
```bash
# Real-time stats
docker stats osm-tagging-mcp

# One-time stats
docker stats --no-stream osm-tagging-mcp
```

**Health status:**
```bash
# Check health endpoint
watch -n 5 curl -s http://localhost:3000/health | jq

# Check readiness endpoint
watch -n 5 curl -s http://localhost:3000/ready | jq
```

### Advanced Monitoring

**Prometheus Metrics** (future feature):
- Endpoint: `/metrics` (planned)
- Metrics: request count, latency, schema stats

**Log Aggregation:**

Use Docker logging drivers:

```bash
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  ...
```

Or external logging:

```bash
docker run -d \
  --log-driver syslog \
  --log-opt syslog-address=tcp://192.168.0.42:514 \
  ...
```

## Scaling

### Vertical Scaling

Increase resources for a single instance:

```bash
docker run -d \
  --memory=2g \
  --cpus=4.0 \
  ...
```

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Instance 1
docker run -d \
  --name osm-tagging-mcp-1 \
  -p 3001:3000 \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Instance 2
docker run -d \
  --name osm-tagging-mcp-2 \
  -p 3002:3000 \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Add load balancer (nginx, HAProxy, Traefik, etc.)
```

**Notes:**
- Server is stateless - scales horizontally easily
- Each instance loads schema independently
- No shared state between instances

## Security

### Container Security

Production security best practices:

1. **No new privileges:**
   ```bash
   --security-opt=no-new-privileges:true
   ```

2. **Read-only filesystem:**
   ```bash
   --read-only --tmpfs /tmp
   ```

3. **Drop capabilities:**
   ```bash
   --cap-drop=ALL
   ```

4. **Non-root user** (configured in Dockerfile)

### Network Security

**Firewall Configuration:**

```bash
# Allow only specific IPs (example)
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw deny 3000
```

**Reverse Proxy** (nginx example):

```nginx
server {
    listen 80;
    server_name osm-mcp.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check endpoint (allow public access)
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

**TLS/SSL** (nginx with Let's Encrypt):

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d osm-mcp.example.com
```

### Image Verification

Verify Docker images are signed and authentic:

```bash
# Verify image signature with cosign
cosign verify ghcr.io/gander-tools/osm-tagging-schema-mcp:latest \
  --certificate-identity-regexp=https://github.com/gander-tools \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# Check for vulnerabilities
docker scan ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

See [Security Documentation](./security.md) for more details.

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs osm-tagging-mcp
```

**Common issues:**
- Port 3000 already in use → Change port mapping (`-p 8080:3000`)
- Insufficient resources → Increase limits (`--memory=1g`)
- Image pull failure → Check network/registry access

### Health Check Failing

**Check health endpoint directly:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

**Common issues:**
- Schema not loaded → Check logs for errors
- Network connectivity → Check firewall rules
- Container resources → Increase memory limit

### High Memory Usage

**Check current usage:**
```bash
docker stats osm-tagging-mcp
```

**Solutions:**
- Normal usage: 100-200MB (schema loaded)
- High usage: >500MB → Check for memory leaks in logs
- OOM killed: Increase memory limit (`--memory=1g`)

### Slow Performance

**Check resource utilization:**
```bash
docker stats osm-tagging-mcp
```

**Solutions:**
- CPU throttling → Increase CPU limits (`--cpus=2.0`)
- Memory pressure → Increase memory limits
- Schema loading delay → Normal on first request (cache warmup)

### Network Issues

**Test connectivity:**
```bash
# From host
curl http://localhost:3000/health

# From another container
docker run --rm \
  curlimages/curl:latest \
  curl http://host.docker.internal:3000/health
```

**Common issues:**
- Port not exposed → Add `-p 3000:3000`
- Firewall blocking → Check firewall rules

### Logs Not Appearing

**Check Docker logging driver:**
```bash
docker inspect osm-tagging-mcp --format='{{.HostConfig.LogConfig.Type}}'
```

**View logs:**
```bash
docker logs osm-tagging-mcp
```

**Increase log verbosity:**
```bash
docker run -d \
  -e LOG_LEVEL=debug \
  ...
```

## Best Practices

1. **Use stable versions in production**: Use specific version tags (e.g., `0.2.1`) or stable tags (`:latest`, `:0.2`), not `:edge`
2. **Set resource limits** to prevent resource exhaustion
3. **Enable health checks** for automatic recovery
4. **Monitor logs** for errors and warnings
5. **Use TLS/SSL** if exposing publicly
6. **Keep images updated** for security patches
7. **Test updates** in staging before production
8. **Document your configuration** (save docker run commands)

### Container Version Selection

Choose the appropriate Docker image tag based on your use case:

| Environment | Recommended Tag | Example | Update Frequency |
|-------------|----------------|---------|------------------|
| Production (stable) | Specific version | `0.2.1` | Manual (controlled) |
| Production (auto-update minor) | Minor version | `0.2` | Automatic (minor patches) |
| Production (auto-update major) | Major version | `0` | Automatic (all updates) |
| Production (latest stable) | `latest` | `latest` | Automatic (stable releases) |
| Development/Testing | `edge` | `edge` | Automatic (bleeding edge) |

**Note:** For production deployments, specific version tags (`0.2.1`) are recommended for maximum control and predictability.

## Next Steps

- [Configuration Guide](../user/configuration.md) - Detailed configuration options
- [API Documentation](../api/README.md) - Tool reference
- [Security Guide](./security.md) - Security best practices
- [Troubleshooting](../user/troubleshooting.md) - Common issues

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/gander-tools/osm-tagging-schema-mcp/issues)
- **Documentation**: [README.md](../../README.md)
- **Discussions**: [GitHub Discussions](https://github.com/gander-tools/osm-tagging-schema-mcp/discussions)
