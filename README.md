# OpenStreetMap Tagging Schema MCP Server

<!-- CI/CD Status -->
[![Test](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/test.yml?branch=master&label=tests&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/test.yml)
[![Fuzzing](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/fuzz.yml?branch=master&label=fuzzing&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/fuzz.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/gander-tools/osm-tagging-schema-mcp/publish-npm.yml?branch=master&label=release&logo=github-actions)](https://github.com/gander-tools/osm-tagging-schema-mcp/actions/workflows/publish-npm.yml)
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
[![Last Commit](https://img.shields.io/github/last-commit/gander-tools/osm-tagging-schema-mcp/master?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/commits/master)
[![GitHub Issues](https://img.shields.io/github/issues/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/gander-tools/osm-tagging-schema-mcp?logo=github)](https://github.com/gander-tools/osm-tagging-schema-mcp/pulls)

## What is this?

This is a **Model Context Protocol (MCP) server** designed specifically for AI agents and LLM applications. It acts as a bridge between artificial intelligence systems and the comprehensive OpenStreetMap tagging knowledge base provided by the official `@openstreetmap/id-tagging-schema` library.

## Project status

This project is a **Proof of Concept**. It gives real value in some areas and has known gaps in others, both described honestly below.

- It works with the latest tagging schema, `@openstreetmap/id-tagging-schema` **v7**.
- A better replacement tool is being worked on. It will arrive later than originally planned, and no date is promised.
- A public instance is available at [https://mcp.gander.tools/osm-tagging/](https://mcp.gander.tools/osm-tagging/).

Bug reports and ideas: open an [issue](https://github.com/gander-tools/osm-tagging-schema-mcp/issues) or start a [discussion](https://github.com/gander-tools/osm-tagging-schema-mcp/discussions).

## How it works

The server runs over stdio (default) or HTTP and exposes the tagging schema as MCP tools. Every tool reads the schema data shipped in `@openstreetmap/id-tagging-schema` (presets, fields, deprecated tags, translations) and answers from it deterministically. There is no network access to OSM and no AI inside the server: the AI agent calls the tools and interprets the results.

Validation checks a tag against the schema: known key, value allowed by the matching field, deprecated key/value with a suggested replacement.

## Test results

Tested through the MCP stdio protocol against the `edge` Docker image with schema v7. Test data came from local taginfo databases: 265 popular key=value pairs from 18 feature keys (15 most popular wiki-described values per key), the 200 most popular keys, and 325 tags marked `deprecated`/`obsolete` on the OSM wiki.

| Tool | Check | Result |
|---|---|---|
| `validate_tag` | popular tags accepted as valid | 265/265 (100%) |
| `validate_tag` | no false `deprecated` on popular tags | 263/265 (99.2%) |
| `validate_tag` | wiki-deprecated/obsolete tags detected | 66/325 (20.3%) |
| `validate_tag_collection` | consistent with `validate_tag` | 80/80 (100%) |
| `search_tags` | key found by name | 119/200 (59.5%) |
| `search_tags` | key found despite a typo | 0/97 (0%) |
| `search_presets` | `key/value` preset in results | 182/265 (68.7%) |
| `search_presets` | `key/value` preset in top 3 | 148/265 (55.8%) |
| `get_tag_values` | taginfo values present in the list | 222/229 (96.9%) |
| `get_preset_details` | preset for popular tag exists | 246/265 (92.8%) |
| `suggest_improvements` | preset matched for popular tag | 244/265 (92.1%) |
| `compare_tags` | stats match local computation | 150/150 (100%) |
| `flat_to_json` / `json_to_flat` | special characters preserved | 173/173 (100%) |
| `json_to_flat` | JSON → flat → JSON round-trip | 60/60 (100%) |
| `json_to_flat` | keys sorted alphabetically (as documented) | 0/60 (0%) |

### What works

- **`compare_tags`**: results match local computation; text and JSON input give identical output.
- **`flat_to_json` / `json_to_flat`**: lossless conversion, including `;`, spaces, `=`, Unicode, `:` and `/`.
- **`validate_tag_collection`**: consistent with `validate_tag`.
- **`validate_tag`** on popular tags: no errors and almost no false alarms.
- **Selected deprecated tags** are detected with a replacement, e.g. `amenity=gym` → `leisure=fitness_centre`, `amenity=nursery` → `amenity=kindergarten`.
- **`get_tag_values`, `get_preset_details`, `suggest_improvements`**: cover over 92% of popular tags.
- **Bad input** gives readable errors (empty key, malformed text with line number, unknown preset) or empty lists instead of crashes.

### What does not work or works poorly

- **Deprecated tag detection**: only 20.3% of wiki-deprecated tags are flagged; 79.7% pass as valid. The wiki and the schema do not always agree, so part of the gap may be a source difference.
- **Typo tolerance in `search_tags`**: none (0/97), despite the tool description mentioning fuzzy matching.
- **Key search in `search_tags`**: 59.5% hit rate; keys with a colon (`addr:street`, `addr:housenumber`, `source:date`) are often not found.
- **Multi-word `search_presets` queries**: `"bicycle parking"` returns an empty list although the preset exists.
- **`search_presets` ranking**: the popular preset is in the top 3 only 55.8% of the time.
- **Broken `search_tags` entry**: for key `access`, one `keyMatches` item has no `key` field and empty names.
- **`json_to_flat` sorting**: documented as alphabetical, but input order is kept.
- **Lenient validation**: a mistyped value (`highway=residental`), a value outside the field options (`wheelchair=maybe`) and an unknown key all return `valid: true`. The problem appears only in `message`; `errorCount` stays 0.
- **Missing presets/values**: 19 of 265 popular tags (e.g. `historic=*`, `craft=grinding_mill`, `railway=stop`) have no preset; 7 taginfo values are missing from `get_tag_values`. Probably schema scope; not verified directly.
- **False `deprecated` alarms**: `railway=platform` and `railway=station`, both still in use.

### Limits of these tests

- 18 keys × 15 values is not representative of the whole schema.
- The wiki is a reference, not an oracle: wiki `deprecated` does not always mean deprecated in the schema.
- Only English wiki pages and only the wiki → tool direction were checked.
- The typo test removes one character at position 3 and covers no other error types.
- Results come from a single run of the `edge` image with schema v7.

## Summary

Useful where deterministic logic is enough: format conversion, comparing tag sets, reading presets and values, validating popular tags. Weakest areas: deprecated tag detection and search (typos, multiple words, colon keys).

## What this is NOT

⚠️ **Important clarifications:**

- **Not a standalone application**: This server requires integration with AI systems (like Claude Code or Claude Desktop) to be useful. It has no user interface or web frontend.
- **Not for direct human use**: Without an AI agent as an intermediary, this tool provides no value to end users. It's designed exclusively for programmatic access by LLM applications.
- **Not a public API for general use**: The deployed service at mcp.gander.tools is intended for integration with AI agents, not for direct HTTP requests or high-volume automated queries. Please do not attempt to abuse the service with DDoS attacks or excessive traffic.

If you're looking for a user-facing OSM tagging tool, consider [iD editor](https://github.com/openstreetmap/iD) or [JOSM](https://josm.openstreetmap.de/) instead.

## Features

**10 MCP Tools** organized into 5 categories:

- **Tag Query** (2): `get_tag_values`, `search_tags`
- **Preset Discovery** (2): `search_presets`, `get_preset_details`
- **Validation** (3): `validate_tag`, `validate_tag_collection`, `suggest_improvements`
- **Comparison** (1): `compare_tags`
- **Format Conversion** (2): `flat_to_json`, `json_to_flat`

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
