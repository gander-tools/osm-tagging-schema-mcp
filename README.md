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

[![MCP Badge](https://lobehub.com/badge/mcp/gander-tools-osm-tagging-schema-mcp?style=plastic)](https://lobehub.com/mcp/gander-tools-osm-tagging-schema-mcp)

## What is this?

To jest serwer **Model Context Protocol (MCP)** — podpina się pod Twój LLM (np. Claude, Cursor, VS Code Copilot) i daje mu wiedzę o tagach OpenStreetMap. Nie jest to aplikacja dla człowieka — obsługuje ją AI, nie Ty bezpośrednio.

**Hosted instance**: `https://mcp.gander.tools/osm-tagging/`

## What this is NOT

Jeśli wejdziesz przeglądarką pod adres serwera, zobaczysz coś takiego:

```json
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Not Acceptable: Client must accept text/event-stream"},"id":null}
```

To jest **prawidłowa odpowiedź** — endpoint wymaga klienta MCP (AI), nie przeglądarki. Człowiek nie ma tu czego szukać.

## Installation

Podłącz serwer do swojego klienta MCP przez `mcp.json`. Możesz użyć gotowej instancji hostowanej lub uruchomić lokalnie.

### Hosted instance (zalecane)

```json
{
  "mcpServers": {
    "osm-tagging-schema": {
      "type": "http",
      "url": "https://mcp.gander.tools/osm-tagging/"
    }
  }
}
```

### Lokalnie przez npx

```json
{
  "mcpServers": {
    "osm-tagging-schema": {
      "command": "npx",
      "args": ["-y", "@gander-tools/osm-tagging-schema-mcp"]
    }
  }
}
```

### Lokalnie przez Docker

```json
{
  "mcpServers": {
    "osm-tagging-schema": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "ghcr.io/gander-tools/osm-tagging-schema-mcp:latest"]
    }
  }
}
```

### Testing with MCP Inspector

```bash
# Hosted instance
npx @modelcontextprotocol/inspector --cli https://mcp.gander.tools/osm-tagging/ --transport http

# Local npx
npx @modelcontextprotocol/inspector npx @gander-tools/osm-tagging-schema-mcp

# Local Docker
npx @modelcontextprotocol/inspector docker run --rm -i ghcr.io/gander-tools/osm-tagging-schema-mcp
```

## License

GNU General Public License v3.0 - See [LICENSE](./LICENSE) file for details.
