# OpenStreetMap Tagging Schema MCP Server

<!-- CI/CD Status -->
[![Test](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/test.yml?branch=master&label=tests&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/test.yml)
[![Fuzzing](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/fuzz.yml?branch=master&label=fuzzing&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/fuzz.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/release-please.yml?label=release&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/release-please.yml)
[![Docker](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/publish-docker.yml?branch=master&label=docker&logo=docker)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/publish-docker.yml)

<!-- Package Information -->
[![npm downloads](https://img.shields.io/npm/dm/@gander-tools/osm-tagging-schema-mcp?logo=npm)](https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp)
[![GitHub Release](https://img.shields.io/github/v/release/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/releases)

<!-- Dependencies -->
[![TypeScript](https://img.shields.io/npm/dependency-version/@gander-tools/osm-tagging-schema-mcp/dev/typescript?logo=typescript&color=3178C6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/npm/dependency-version/@gander-tools/osm-tagging-schema-mcp/@modelcontextprotocol/sdk?label=MCP%20SDK&color=orange)](https://modelcontextprotocol.io)
[![OSM Schema](https://img.shields.io/npm/dependency-version/@gander-tools/osm-tagging-schema-mcp/@openstreetmap/id-tagging-schema?label=OSM%20Schema&color=blue)](https://github.com/openstreetmap/id-tagging-schema)

<!-- Code Quality & Security -->
[![Code Quality](https://img.shields.io/badge/code%20quality-BiomeJS-60a5fa?logo=biome)](https://biomejs.dev/)
[![NPM Provenance](https://img.shields.io/badge/provenance-npm-CB3837?logo=npm)](https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp)
[![SLSA 3](https://img.shields.io/badge/SLSA-Level%203-green?logo=github)](docs/deployment/security.md#slsa-build-provenance)

<!-- Project Information -->
[![License: GPL-3.0](https://img.shields.io/github/license/gander-tools/osm-tagging-schema-mcp?logo=gnu)](https://www.gnu.org/licenses/gpl-3.0)
[![Last Commit](https://img.shields.io/github/last-commit/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/commits/master)
[![GitHub Issues](https://img.shields.io/github/issues/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/pulls)

## What is this?

This is a **Model Context Protocol (MCP) server** designed specifically for AI agents and LLM applications. It acts as a bridge between artificial intelligence systems and the comprehensive OpenStreetMap tagging knowledge base provided by the official `@openstreetmap/id-tagging-schema` library.

**Current Status**: Production-ready MCP server, actively maintained and continuously improved. The service is deployed and accessible at [https://mcp.gander.tools/osm-tagging/](https://mcp.gander.tools/osm-tagging/).

**We welcome your feedback!** Have ideas for improvements? Found a bug? Want to discuss features? Please open an [issue](https://github.com/gander-tools/osm-tagging-schema-mcp/issues) or start a [discussion](https://github.com/gander-tools/osm-tagging-schema-mcp/discussions).

## What this is NOT

⚠️ **Important clarifications:**

- **Not a standalone application**: This server requires integration with AI systems (like Claude Code or Claude Desktop) to be useful. It has no user interface or web frontend.
- **Not for direct human use**: Without an AI agent as an intermediary, this tool provides no value to end users. It's designed exclusively for programmatic access by LLM applications.
- **Not a public API for general use**: The deployed service at mcp.gander.tools is intended for integration with AI agents, not for direct HTTP requests or high-volume automated queries. Please do not attempt to abuse the service with DDoS attacks or excessive traffic.

If you're looking for a user-facing OSM tagging tool, consider [iD editor](https://github.com/openstreetmap/iD) or [JOSM](https://josm.openstreetmap.de/) instead.

## Features

**7 MCP Tools** organized into 3 categories:

- **Tag Query** (2 tools): Query tag values and search tags
- **Preset Discovery** (2 tools): Search and explore OSM presets with detailed configurations
- **Validation** (3 tools): Validate tags, check for deprecated tags, suggest improvements

📖 **Full tool reference**: [docs/api/](./docs/api/README.md)

## Installation

### Using npx (Recommended)

```bash
# No installation needed - run directly
npx @gander-tools/osm-tagging-schema-mcp
```

### Using Docker

```bash
# Run with stdio transport
docker run -i ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

📖 **More options**: [docs/user/installation.md](./docs/user/installation.md) (source installation, verification, troubleshooting)

## Quick Start

### With Claude Code CLI

```bash
# Add to Claude Code
claude mcp add --transport stdio osm-tagging-schema -- npx -y @gander-tools/osm-tagging-schema-mcp

# Use in conversations
# Ask Claude: "What OSM tags are available for restaurants?"
# Ask Claude: "Validate these tags: amenity=parking, capacity=50"
```

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "osm-tagging-schema": {
      "command": "npx",
      "args": ["@gander-tools/osm-tagging-schema-mcp"]
    }
  }
}
```

📖 **Next steps**:
- [Configuration Guide](./docs/user/configuration.md) - Setup for Claude Code/Desktop and custom clients
- [Usage Guide](./docs/user/usage.md) - Tool examples and workflows
- [API Reference](./docs/api/README.md) - Complete tool documentation
- [Deployment Guide](./docs/deployment/deployment.md) - Production HTTP/Docker deployment

### Testing with MCP Inspector

Test and debug the server using the official [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
# Test published package (quickest)
npx @modelcontextprotocol/inspector npx @gander-tools/osm-tagging-schema-mcp

# Test Docker image
npx @modelcontextprotocol/inspector docker run --rm -i ghcr.io/gander-tools/osm-tagging-schema-mcp
```

The Inspector provides an interactive web UI to test all tools, inspect responses, and debug issues.

📖 **Complete inspection guide**: [docs/development/inspection.md](./docs/development/inspection.md) (includes HTTP transport testing)

## Development

Built with **Test-Driven Development (TDD)** and **Property-Based Fuzzing**:
- Comprehensive test suite (unit + integration) with 100% pass rate
- Property-based fuzz tests with fast-check for edge case discovery
- Continuous fuzzing in CI/CD (weekly schedule + on every push/PR)

```bash
npm install      # Install dependencies
npm test         # Run all tests
npm run test:fuzz # Run fuzz tests
npm run build    # Build for production
```

📖 **Development guides**: [docs/development/development.md](./docs/development/development.md) | [docs/development/fuzzing.md](./docs/development/fuzzing.md)

## Contributing

Contributions welcome! This project follows **Test-Driven Development (TDD)**.

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a feature branch
4. Write tests first, then implement
5. Ensure all tests pass: `npm test`
6. Submit a pull request

📖 **Guidelines**: [docs/development/contributing.md](./docs/development/contributing.md)

## Documentation

### Quick Navigation

**Choose your path:**

| I want to... | Go to |
|-------------|-------|
| **Install and run the server** | [Installation Guide](./docs/user/installation.md) |
| **Configure with Claude Code/Desktop** | [Configuration Guide](./docs/user/configuration.md) |
| **Learn how to use the tools** | [Usage Guide](./docs/user/usage.md) → [API Reference](./docs/api/README.md) |
| **Test and debug the server** | [Inspection Guide](./docs/development/inspection.md) |
| **Deploy in production (HTTP/Docker)** | [Deployment Guide](./docs/deployment/deployment.md) |
| **Fix issues or errors** | [Troubleshooting Guide](./docs/user/troubleshooting.md) |
| **Contribute to the project** | [Contributing Guide](./docs/development/contributing.md) |

### Complete Documentation

**User Guides:**
- [Installation](./docs/user/installation.md) - Setup guide (npx, Docker, source)
- [Configuration](./docs/user/configuration.md) - Claude Code/Desktop configuration
- [Usage](./docs/user/usage.md) - Tool examples and workflows
- [API Reference](./docs/api/README.md) - Complete tool documentation
- [Troubleshooting](./docs/user/troubleshooting.md) - Common issues and solutions

**Developer Docs:**
- [Contributing](./docs/development/contributing.md) - Contribution guidelines (TDD workflow)
- [Development](./docs/development/development.md) - Development setup and debugging
- [Inspection](./docs/development/inspection.md) - MCP Inspector testing guide
- [Fuzzing](./docs/development/fuzzing.md) - Security fuzzing and property testing
- [Roadmap](./docs/development/roadmap.md) - Project roadmap and future features
- [Release Process](./docs/development/release-process.md) - Release and publishing workflow

**Deployment Docs:**
- [Deployment](./docs/deployment/deployment.md) - HTTP/Docker production deployment
- [Security](./docs/deployment/security.md) - Security features, provenance, and SLSA

**Project Info:**
- [CHANGELOG.md](./CHANGELOG.md) - Version history

## License

GNU General Public License v3.0 - See [LICENSE](./LICENSE) file for details.

---

[![MCP Badge](https://lobehub.com/badge/mcp/gander-tools-osm-tagging-schema-mcp?style=plastic)](https://lobehub.com/mcp/gander-tools-osm-tagging-schema-mcp)
