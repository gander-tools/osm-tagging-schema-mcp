# Development Guide

This guide provides detailed instructions for setting up and working with the OSM Tagging Schema MCP Server codebase.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Testing Strategy](#testing-strategy)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Troubleshooting](#troubleshooting)

## Environment Setup

### System Requirements

- **Node.js**: 24.0.0 or higher
- **npm**: 11.0.0 or higher
- **Git**: Latest stable version
- **OS**: Linux, macOS, or Windows with WSL2

### Recommended Tools

- **Editor**: VS Code with extensions:
  - Biome (official Biome extension)
  - TypeScript and JavaScript Language Features
  - ESLint (disabled in favor of Biome)
- **Terminal**: Any modern terminal with Unicode support

### Initial Setup

```bash
# Clone repository
git clone https://github.com/gander-tools/osm-tagging-schema-mcp.git
cd osm-tagging-schema-mcp

# Install dependencies
npm install

# Verify installation
npm test
npm run build
```

## Project Structure

```
osm-tagging-schema-mcp/
├── src/                          # Source code
│   ├── index.ts                  # MCP server entry point
│   ├── tools/                    # MCP tool implementations
│   │   ├── types.ts              # Shared type definitions
│   │   ├── get-schema-stats.ts   # One file per tool
│   │   ├── get-categories.ts
│   │   ├── get-category-tags.ts
│   │   ├── get-tag-values.ts
│   │   ├── get-tag-info.ts
│   │   ├── get-related-tags.ts
│   │   ├── search-tags.ts
│   │   ├── search-presets.ts
│   │   ├── get-preset-details.ts
│   │   ├── get-preset-tags.ts
│   │   ├── validate-tag.ts
│   │   ├── validate-tag-collection.ts
│   │   ├── check-deprecated.ts
│   │   └── suggest-improvements.ts
│   └── utils/                    # Utility functions
│       ├── schema-loader.ts      # Schema loading and indexing
│       └── validators.ts         # Validation utilities
├── tests/                        # Test files
│   ├── tools/                    # Unit tests (one per tool)
│   ├── utils/                    # Utility tests
│   └── integration/              # Integration tests
│       ├── helpers.ts            # Shared test utilities
│       └── *.test.ts             # One integration test per tool
├── dist/                         # Build output (gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── .github/                      # GitHub workflows
│   └── workflows/
│       ├── test.yml              # CI testing
│       ├── publish-docker.yml    # Docker builds
│       └── publish-npm.yml       # NPM releases
├── package.json                  # Project metadata
├── tsconfig.json                 # TypeScript configuration
├── biome.json                    # Biome configuration
├── .pre-commit-config.yaml       # Git hooks configuration (pre-commit)
├── README.md                     # User documentation
├── ROADMAP.md                    # Development roadmap
├── CHANGELOG.md                  # Project changelog
├── CONTRIBUTING.md               # Contribution guidelines
├── DEVELOPMENT.md                # This file
├── CLAUDE.md                     # Technical notes
└── LICENSE                       # GPL-3.0 license
```

### Key Directories

- **src/tools/**: Each MCP tool is a separate file
- **tests/tools/**: Unit tests (one file per tool)
- **tests/integration/**: Integration tests via MCP protocol
- **src/utils/**: Shared utilities (schema loader, validators)

## Development Commands

### Testing

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
node --import tsx --test tests/tools/my-tool.test.ts

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run linter (BiomeJS)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check (TypeScript)
npm run typecheck
```

### Git Hooks

This project uses [pre-commit](https://pre-commit.com/) for automated code quality checks.

**Prerequisites**: Python 3.x and the `pre-commit` package (`pip install pre-commit` or `brew install pre-commit`).

```bash
# Install hooks (done automatically by npm install)
pre-commit install
pre-commit install --hook-type pre-push

# Run pre-commit hooks manually
pre-commit run --all-files

# Run pre-push hooks manually
pre-commit run --hook-stage pre-push

# Skip hooks (not recommended)
git commit --no-verify  # Skip pre-commit
git push --no-verify    # Skip pre-push
```

**Pre-commit hooks** (auto-run before commits):
- Code formatting (BiomeJS)
- Linting with auto-fix (BiomeJS)

**Pre-push hooks** (auto-run before pushes):
- Type checking (TypeScript)
- Unit tests
- Integration tests
- Build verification

### Build & Run

```bash
# Build for production
npm run build

# Run the MCP server
npm start

# Run in development mode (with tsx)
npx tsx src/index.ts
```

### Docker

```bash
# Build Docker image
docker build -t osm-tagging-schema-mcp .

# Run container
docker run -i osm-tagging-schema-mcp
```

#### Updating Docker Base Image Digest

The Dockerfile uses **manifest list digests** (not platform-specific digests) to pin the Node.js base image for security while supporting multi-platform builds (linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6, linux/s390x).

**Key Concepts:**

- **Platform-Specific Digest**: SHA256 hash of a single architecture image (e.g., only amd64)
  - ❌ **Do NOT use** for multi-platform builds - causes "exec format error"
  - Example: `sha256:ef30b897b4b924010aab656801cb44fe27589b5d0724ba080b191d75f1f81af0` (amd64 only)

- **Manifest List Digest**: SHA256 hash of a manifest list referencing multiple architectures
  - ✅ **Correct** for multi-platform builds - Docker automatically selects the right platform
  - Example: `sha256:b2358485e3e33bc3a33114d2b1bdb18cdbe4df01bd2b257198eb51beb1f026c5` (all platforms)

**How to Update:**

```bash
# Get the current manifest list digest for node:24-alpine
curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq -r '.digest'

# Alternative: Use Docker buildx (requires Docker installed)
docker buildx imagetools inspect node:24-alpine --format "{{.Manifest.Digest}}"

# Verify it's a manifest list (should show multiple platforms)
curl -s https://hub.docker.com/v2/repositories/library/node/tags/24-alpine | jq '.images[] | {arch: .architecture, digest: .digest}'
```

**Expected Output:**
```json
[
  {
    "arch": "amd64",
    "digest": "sha256:ef30b897b4b9..."
  },
  {
    "arch": "arm64",
    "digest": "sha256:16bb4fe031ce..."
  },
  {
    "arch": "arm",
    "digest": "sha256:be91a227520..."
  }
]
```

**Update Process:**

1. Get the new manifest list digest using the command above
2. Update BOTH `FROM` statements in the Dockerfile (builder and runtime stages)
3. Update the comment showing supported platforms
4. Test multi-platform build locally:
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 -t test .
   ```
5. Commit the changes

**Security Note:**

Using manifest list digests provides:
- ✅ **Reproducible builds** - Exact same base image every time
- ✅ **Supply chain security** - Protection against base image tampering
- ✅ **Multi-platform support** - Single Dockerfile for all architectures
- ✅ **Automated verification** - CI/CD can verify the digest

## Testing Strategy

### Test-Driven Development (TDD)

This project strictly follows TDD:

1. **RED**: Write a failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code quality

### Test Hierarchy

```
1. Unit Tests (tests/tools/*.test.ts)
   ├── Test individual functions in isolation
   ├── Mock external dependencies
   └── Fast execution (<1s per suite)

2. Integration Tests (tests/integration/*.test.ts)
   ├── Test MCP protocol communication
   ├── Use real MCP client/server
   └── Verify end-to-end functionality

3. JSON Data Integrity Tests
   ├── Validate against actual schema JSON files
   ├── Test ALL values (100% coverage)
   └── Ensure compatibility with schema updates
```

### Writing Tests

**Unit Test Example:**

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SchemaLoader } from "../../src/utils/schema-loader.js";
import { myTool } from "../../src/tools/my-tool.js";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };

describe("myTool", () => {
  describe("Basic Functionality", () => {
    it("should return expected result", async () => {
      const loader = new SchemaLoader({ enableIndexing: true });
      const result = await myTool(loader, "test");

      assert.ok(result);
      assert.strictEqual(result.count, 1);
    });
  });

  describe("JSON Schema Data Integrity", () => {
    it("should validate against all presets", async () => {
      const loader = new SchemaLoader({ enableIndexing: true });

      // Test EVERY preset (100% coverage)
      for (const presetId of Object.keys(presets)) {
        const result = await myTool(loader, presetId);
        assert.ok(result, `Should handle preset: ${presetId}`);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", async () => {
      const loader = new SchemaLoader({ enableIndexing: true });
      const result = await myTool(loader, "");

      assert.strictEqual(result.count, 0);
    });
  });
});
```

**Integration Test Example:**

```typescript
import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { setupClientServer, type TestServer, teardownClientServer } from "./helpers.js";

describe("Integration: my_tool", () => {
  let client: Client;
  let server: TestServer;

  beforeEach(async () => {
    ({ client, server } = await setupClientServer());
  });

  afterEach(async () => {
    await teardownClientServer(client, server);
  });

  it("should register tool", async () => {
    const response = await client.listTools();
    const tool = response.tools.find((t) => t.name === "my_tool");

    assert.ok(tool);
    assert.strictEqual(tool.name, "my_tool");
  });

  it("should execute tool successfully", async () => {
    const response = await client.callTool({
      name: "my_tool",
      arguments: { param: "value" },
    });

    assert.ok(response.content);
    const result = JSON.parse((response.content[0] as { text: string }).text);
    assert.ok(result);
  });
});
```

### Test Coverage Requirements

- **Minimum**: 90% across all modules
- **Goal**: 100% for critical paths
- **JSON Integrity**: 100% validation against schema data

## Debugging

### MCP Inspector

For interactive testing and debugging, use the **MCP Inspector** - a web-based tool for testing MCP servers.

**Quick Start**:
```bash
# Test published package
npx @modelcontextprotocol/inspector npx @gander-tools/osm-tagging-schema-mcp

# Test Docker image
npx @modelcontextprotocol/inspector docker run --rm -i ghcr.io/gander-tools/osm-tagging-schema-mcp

# Test local changes
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

**See [Inspection Guide](./inspection.md)** for comprehensive documentation on all inspection methods, HTTP transport testing, and troubleshooting.

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "program": "${workspaceFolder}/src/index.ts",
      "runtimeArgs": ["--import", "tsx"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/.bin/node",
      "args": ["--import", "tsx", "--test", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Debugging

```javascript
// Add debug logging in code
console.log("Debug:", JSON.stringify(data, null, 2));
```

```bash
# Run with debug output
DEBUG=* npm start
```

### Log Level Configuration

The server includes a built-in logger with configurable levels. Control logging verbosity using the `LOG_LEVEL` environment variable:

```bash
# Available log levels (in order of verbosity):
# - SILENT: No logging
# - ERROR: Only errors
# - WARN: Errors and warnings
# - INFO: Errors, warnings, and info (default)
# - DEBUG: All messages including debug

# Run with debug logging
LOG_LEVEL=DEBUG npm start

# Run with minimal logging
LOG_LEVEL=ERROR npm start

# Run with no logging
LOG_LEVEL=SILENT npm start
```

**Log Output Format:**
```
2025-11-10T12:34:56.789Z [INFO] [main] Starting OSM Tagging Schema MCP Server
2025-11-10T12:34:56.890Z [DEBUG] [MCPServer] Tool call: get_schema_stats
2025-11-10T12:34:56.950Z [ERROR] [MCPServer] Error executing tool: invalid_tool
```

**Development Tips:**
- Use `DEBUG` level during development to see all tool calls
- Use `INFO` level (default) for normal operation
- Use `ERROR` level in production to reduce noise
- Logs are written to stderr to not interfere with MCP protocol (stdout)

### Test Debugging

```bash
# Run single test file with verbose output
node --import tsx --test tests/tools/my-tool.test.ts

# Run specific test by name
node --import tsx --test tests/tools/my-tool.test.ts --test-name-pattern "should do X"

# Debug failing test
node --inspect-brk --import tsx --test tests/tools/my-tool.test.ts
```

## Common Development Tasks

### Adding a New MCP Tool

1. **Write unit tests** (TDD RED):
   ```bash
   touch tests/tools/my-new-tool.test.ts
   # Write failing tests
   npm test  # Should fail
   ```

2. **Implement the tool** (TDD GREEN):
   ```bash
   touch src/tools/my-new-tool.ts
   # Implement minimal code
   npm test  # Should pass
   ```

3. **Register in MCP server**:
   - Add import in `src/index.ts`
   - Add to `ListToolsRequestSchema` tools array
   - Add handler in `CallToolRequestSchema`

4. **Add integration tests**:
   ```bash
   touch tests/integration/my-new-tool.test.ts
   # Write integration tests
   ```

5. **Update documentation**:
   - Add to README.md tools table
   - Update ROADMAP.md
   - Add to CHANGELOG.md

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update @openstreetmap/id-tagging-schema

# Update all packages
npm update

# After updating, verify tests
npm test
```

### Running Linter and Formatter

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix

# Format all files
npm run format

# Format specific file
npx biome format --write src/tools/my-tool.ts
```

### Building for Production

```bash
# Clean build
rm -rf dist/
npm run build

# Verify build
node dist/index.js
```

## Troubleshooting

### Tests Failing After Schema Update

If tests fail after updating `@openstreetmap/id-tagging-schema`:

1. Check what changed in the schema
2. Update tool logic to handle new data structures
3. Update tests to match new schema
4. This is **expected behavior** - tests validate compatibility

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf dist/

# Rebuild
npm run build

# Check for type errors
npm run typecheck
```

### Import Errors

Ensure you're using the correct import syntax:

```typescript
// ✅ Correct (ES modules with .js extension)
import { myTool } from "./my-tool.js";

// ❌ Wrong (no extension)
import { myTool } from "./my-tool";
```

### Test Timeouts

If tests timeout, increase the timeout:

```typescript
// In test file
import { describe, it } from "node:test";

it("long running test", { timeout: 10000 }, async () => {
  // Test code
});
```

### Docker Build Issues

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t osm-tagging-schema-mcp .
```

## Performance Tips

### Faster Test Execution

```bash
# Run tests in parallel (default)
npm test

# Run tests sequentially (for debugging)
npm test -- --test-concurrency=1

# Run only unit tests (faster)
npm run test:unit
```

### Faster Development Iteration

```bash
# Use watch mode for instant feedback
npm run test:watch

# Use tsx for faster TypeScript execution
npx tsx src/index.ts
```

### Schema Loader Caching

The schema loader caches data by default. For development:

```typescript
// Disable caching for testing
const loader = new SchemaLoader({
  enableIndexing: true,
  cacheTTL: 0  // Disable cache
});
```

## Additional Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [BiomeJS Documentation](https://biomejs.dev/)
- [OSM Tagging Schema](https://github.com/openstreetmap/id-tagging-schema)

## Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/gander-tools/osm-tagging-schema-mcp/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/gander-tools/osm-tagging-schema-mcp/discussions)
- **Documentation**: See [contributing.md](./contributing.md) for contribution guidelines
