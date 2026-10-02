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
[![SLSA 3](https://img.shields.io/badge/SLSA-Level%203-green?logo=github)](https://slsa.dev/spec/v1.0/levels)

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

Bug reports and ideas: open an [issue](https://github.com/gander-tools/osm-tagging-schema-mcp/issues) or start a [discussion](https://github.com/gander-tools/osm-tagging-schema-mcp/discussions).

## How it works

The server runs over stdio (default) or HTTP and exposes the tagging schema as MCP tools. Every tool reads the schema data shipped in `@openstreetmap/id-tagging-schema` (presets, fields, deprecated tags, translations) and answers from it deterministically. There is no network access to OSM and no AI inside the server: the AI agent calls the tools and interprets the results.

Validation checks a tag against the schema: known key, value allowed by the matching field, deprecated key/value with a suggested replacement.

## What works and what doesn't

The tool has limitations. Know what to expect before relying on it: it answers from the schema data only, and a part of the tags that exist in the wild or on the OSM wiki is not covered.

| Tool                      | Works                                                                                   | Limitations                                                                                                          |
|---------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `validate_tag`            | Popular tags accepted (100%), almost no false `deprecated` alarms (99.2%)               | Detects only ~20% of wiki-deprecated tags; typos and foreign values are accepted as valid (custom tags are allowed); `railway=platform` and `railway=station` are wrongly flagged as deprecated |
| `validate_tag_collection` | Consistent with `validate_tag` (100%)                                                   | Same gaps as `validate_tag`; control characters are not reported                                                      |
| `suggest_improvements`    | Preset matched for 92% of popular tags                                                  | Typos and foreign values usually yield suggestions, not a problem report                                              |
| `get_tag_values`          | 97% of taginfo values present; bad keys and limits rejected                             | A few taginfo values are missing from the lists                                                                       |
| `search_tags`             | Finds 60% of keys by name                                                               | No typo tolerance despite the fuzzy-matching description; keys with a colon (`addr:street`) are often missed; `limit` of 0 or negative not always rejected; `access` returns a `keyMatches` item without `key` |
| `search_presets`          | Preset found for 69% of popular tags (56% in top 3)                                     | Multi-word queries (`bicycle parking`) can return nothing; weak ranking; `limit` of 0 or negative not always rejected |
| `get_preset_details`      | Preset exists for 93% of popular tags; unknown ids always rejected                      | Some popular tags (e.g. `historic=*`, `craft=grinding_mill`, `railway=stop`) have no preset                           |
| `compare_tags`            | Matches local computation (100%); text and JSON input give identical output             | Compares any tag sets, so it never says a tag is wrong; only malformed input is rejected                              |
| `flat_to_json`            | Lossless, including `;`, spaces, `=`, Unicode, `:` and `/`                              | Duplicate keys and control characters are accepted silently                                                           |
| `json_to_flat`            | Lossless round-trip (100%); bad input rejected                                          | Keys are not sorted alphabetically, input order is kept                                                               |

Across all tools, invalid input never crashed the server: errors are readable or the result is an empty list.

## Summary

Useful where deterministic logic is enough: format conversion, comparing tag sets, reading presets and values, validating popular tags. Weakest areas: deprecated tag detection and search (typos, multiple words, colon keys).

## What this is NOT

⚠️ **Important clarifications:**

- **Not a standalone application**: This server requires integration with AI systems (like Claude Code or Claude Desktop) to be useful. It has no user interface or web frontend.
- **Not for direct human use**: Without an AI agent as an intermediary, this tool provides no value to end users. It's designed exclusively for programmatic access by LLM applications.

If you're looking for a user-facing OSM tagging tool, consider [iD editor](https://github.com/openstreetmap/iD) or [JOSM](https://josm.openstreetmap.de/) instead.

## Installation

Add the server to Claude Code (stdio):

```bash
# npx
claude mcp add --transport stdio osm-tagging-schema -- npx -y @gander-tools/osm-tagging-schema-mcp

# Docker
claude mcp add --transport stdio osm-tagging-schema -- docker run -i --rm ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

## HTTP transport

stdio is the default. Set `TRANSPORT=http` to serve over HTTP (streamable, port 3000 in the Docker image):

| Variable       | Default                                            | Meaning                              |
|----------------|----------------------------------------------------|--------------------------------------|
| `TRANSPORT`    | `stdio`                                            | `stdio` or `http`                    |
| `PORT`         | `3000`                                             | HTTP port                            |
| `HOST`         | `0.0.0.0`                                          | HTTP bind address                    |
| `CORS_ORIGINS` | `http://localhost:6274,https://mcp.ziziyi.com`     | Comma-separated allowed CORS origins |
| `LOG_LEVEL`    | `INFO`                                             | `SILENT`, `ERROR`, `WARN`, `INFO`, `DEBUG` |

```bash
docker run --rm -p 3000:3000 -e TRANSPORT=http ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

Endpoints: `GET /health` (liveness), `GET /ready` (schema loaded), `GET /version`.

## License

GNU General Public License v3.0 - See [LICENSE](./LICENSE) file for details.
