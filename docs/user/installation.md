# Installation Guide

This guide covers all installation methods for the OSM Tagging Schema MCP Server.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
  - [Using npx (Recommended)](#using-npx-recommended)
  - [From Source](#from-source)
  - [Using Docker](#using-docker)
- [Verification](#verification)
- [Updating](#updating)
- [Uninstallation](#uninstallation)

## System Requirements

### Minimum Requirements

- **Node.js**: 24.0.0 or higher
- **npm**: 11.0.0 or higher
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Memory**: 512 MB RAM minimum
- **Disk Space**: 100 MB free space

### Recommended Requirements

- **Node.js**: Latest LTS version
- **npm**: Latest stable version
- **Memory**: 1 GB RAM or more
- **Disk Space**: 500 MB free space

### Checking Your System

```bash
# Check Node.js version
node --version
# Should output: v24.0.0 or higher

# Check npm version
npm --version
# Should output: 11.0.0 or higher

# Check Docker version (if using Docker)
docker --version
# Should output: Docker version 20.10.0 or higher
```

## Installation Methods

### Using npx (Recommended)

The easiest way to use the server is via `npx`, which doesn't require installation:

```bash
# Run directly with npx (no installation needed)
npx @gander-tools/osm-tagging-schema-mcp
```

**Advantages:**
- No installation required
- Always uses the latest published version
- Automatic cleanup after use
- Perfect for one-time usage or testing

**Usage in MCP client:**
```json
{
  "mcpServers": {
    "osm-tagging": {
      "command": "npx",
      "args": ["@gander-tools/osm-tagging-schema-mcp"]
    }
  }
}
```

### From Source

For development or contributing to the project:

**1. Clone the repository:**
```bash
git clone https://github.com/gander-tools/osm-tagging-schema-mcp.git
cd osm-tagging-schema-mcp
```

**2. Install dependencies:**
```bash
npm install
```

**3. Build the project:**
```bash
npm run build
```

**4. Run the server:**
```bash
# Run built version
npm start

# Or run in development mode with tsx
npx tsx src/index.ts
```

**Usage in MCP client (from source):**
```json
{
  "mcpServers": {
    "osm-tagging": {
      "command": "node",
      "args": ["/absolute/path/to/osm-tagging-schema-mcp/dist/index.js"],
      "cwd": "/absolute/path/to/osm-tagging-schema-mcp"
    }
  }
}
```

### Using Docker

For containerized deployment:

**Container Version Tags:**

The project uses the following tagging strategy:

| Tag | Description | Example | Recommended Use |
|-----|-------------|---------|-----------------|
| `latest` | Latest stable release | `latest` → `0.2.1` | Production (stable) |
| `edge` | Latest master branch | `edge` | Development (bleeding edge) |
| `X.Y.Z` | Specific patch version | `0.2.1` | Production (pinned version) |
| `X.Y` | Latest patch in minor | `0.2` → `0.2.1` | Production (minor updates) |
| `X` | Latest minor in major | `0` → `0.2.1` | Production (major version) |

**1. Pull the image:**
```bash
# Pull latest stable release (recommended for production)
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Pull latest development version (bleeding edge)
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:edge

# Pull specific version (pinned)
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:0.2.1

# Pull latest patch in minor version
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:0.2

# Pull latest minor in major version
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:0
```

> **Note:** All Docker images are publicly available in GitHub Container Registry (ghcr.io) and can be pulled without authentication.

**2. Run the container:**
```bash
# Run with latest stable
docker run -i ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Run with edge (development)
docker run -i ghcr.io/gander-tools/osm-tagging-schema-mcp:edge

# Run with automatic cleanup
docker run -i --rm --pull always ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

**3. Verify image signature (optional but recommended):**
```bash
# Install cosign
# See: https://docs.sigstore.dev/cosign/installation/

# Verify image signature
cosign verify ghcr.io/gander-tools/osm-tagging-schema-mcp:latest \
  --certificate-identity-regexp=https://github.com/gander-tools/osm-tagging-schema-mcp/.* \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

**Usage in MCP client (Docker):**
```json
{
  "mcpServers": {
    "osm-tagging": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "ghcr.io/gander-tools/osm-tagging-schema-mcp:latest"
      ]
    }
  }
}
```

For development with bleeding edge features, use `:edge` instead of `:latest`.

**Building Docker image locally:**
```bash
# Clone repository
git clone https://github.com/gander-tools/osm-tagging-schema-mcp.git
cd osm-tagging-schema-mcp

# Build image
docker build -t osm-tagging-schema-mcp .

# Run local image
docker run -i osm-tagging-schema-mcp
```

## Verification

### Verify Installation

After installation, verify the server works correctly:

**1. Test basic functionality:**
```bash
# If using npx
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | npx @gander-tools/osm-tagging-schema-mcp

# If running from source
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | npm start

# If using Docker (latest stable)
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | docker run -i --rm ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# If using Docker (edge/development)
echo '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | docker run -i --rm ghcr.io/gander-tools/osm-tagging-schema-mcp:edge
```

**Expected output:** JSON response with list of 7 available tools.

**2. Verify all tools are available:**

The response should include these tools (in alphabetical order):
- `get_preset_details`
- `get_tag_values`
- `search_presets`
- `search_tags`
- `suggest_improvements`
- `validate_tag`
- `validate_tag_collection`

### Test with MCP Client

For complete verification, test with an MCP client:

**Claude Code CLI:**
```bash
# Add server to Claude Code CLI
claude mcp add @gander-tools/osm-tagging-schema-mcp

# Test in a conversation
# Ask Claude: "What OSM tags are available for restaurants?"
```

**MCP Inspector (Interactive Testing):**

The MCP Inspector provides an interactive web interface to test and debug MCP servers:

```bash
# Test with npx (quickest)
npx @modelcontextprotocol/inspector npx @gander-tools/osm-tagging-schema-mcp

# Test with Docker
npx @modelcontextprotocol/inspector docker run -i --rm \
  ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

The inspector opens a web interface where you can browse tools, test calls, and debug protocol communication.

📖 **For detailed inspection guide** with HTTP transport testing and troubleshooting, see [Inspection Guide](../development/inspection.md)

## Updating

### Update npx Version

No action needed - `npx` always uses the latest version from npm registry.

### Update Source Installation

```bash
# Navigate to project directory
cd osm-tagging-schema-mcp

# Pull latest changes
git pull origin master

# Install dependencies (in case of changes)
npm install

# Rebuild
npm run build
```

### Update Docker Image

```bash
# Pull latest stable release
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:latest

# Pull latest development version
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:edge

# Pull specific version
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:0.2.1
```

## Uninstallation

### npx Installation

No uninstallation needed - `npx` doesn't install packages globally.

To clear npx cache:
```bash
npm cache clean --force
```

### Source Installation

```bash
# Navigate to project directory
cd osm-tagging-schema-mcp

# Remove node_modules and build output
rm -rf node_modules dist

# Optionally remove the entire directory
cd ..
rm -rf osm-tagging-schema-mcp
```

### Docker Installation

```bash
# Remove specific image tag
docker rmi ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
docker rmi ghcr.io/gander-tools/osm-tagging-schema-mcp:edge

# Remove all versions
docker images | grep osm-tagging-schema-mcp | awk '{print $3}' | xargs docker rmi
```

## Troubleshooting

If you encounter issues during installation, see [docs/troubleshooting.md](./troubleshooting.md) for common problems and solutions.

### Common Installation Issues

**Node.js version too old:**
```bash
# Error: "Node.js version 22.0.0 or higher required"
# Solution: Install Node.js 22+ from https://nodejs.org/
```

**npm permission errors:**
```bash
# Error: "EACCES: permission denied"
# Solution: Don't use sudo with npm. Fix npm permissions:
# https://docs.npmjs.com/resolving-eacces-permissions-errors
```

**Docker daemon not running:**
```bash
# Error: "Cannot connect to the Docker daemon"
# Solution: Start Docker daemon:
sudo systemctl start docker  # Linux
# Or start Docker Desktop on macOS/Windows
```

## Next Steps

After installation, see:
- [Configuration Guide](./configuration.md) - Configure the MCP server
- [Usage Guide](./usage.md) - Learn how to use the server
- [API Documentation](../api/README.md) - Explore available tools

## Getting Help

- **Issues**: Report installation problems on [GitHub Issues](https://github.com/gander-tools/osm-tagging-schema-mcp/issues)
- **Documentation**: See [README.md](../../README.md) for overview
- **Contributing**: See [contributing.md](../development/contributing.md) for development setup
