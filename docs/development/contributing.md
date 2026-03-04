# Contributing to OSM Tagging Schema MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Dependency Version Pinning Policy](#dependency-version-pinning-policy)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Documentation](#documentation)
- [Release and Publishing](#release-and-publishing)

## Code of Conduct

This project follows standard open-source etiquette:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Assume good intentions

## Getting Started

### Prerequisites

- **Node.js**: 24.0.0 or higher
- **npm**: 11.0.0 or higher
- **Git**: Latest version

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/osm-tagging-schema-mcp.git
   cd osm-tagging-schema-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify setup**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   npm run build
   ```

4. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/gander-tools/osm-tagging-schema-mcp.git
   ```

### Git Hooks (Automated Code Quality)

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to automatically run code quality checks before commits and pushes. Hooks are installed automatically when you run `npm install`.

**Pre-commit hooks** (fast checks before committing):
- **Format**: Auto-format code with BiomeJS (`npm run format`)
- **Lint**: Auto-fix linting issues with BiomeJS (`npm run check`)
- Changes are automatically staged if fixed

**Pre-push hooks** (comprehensive checks before pushing):
- **Type checking**: Verify TypeScript types (`npm run typecheck`)
- **Unit tests**: Run fast unit tests (`npm run test:unit`)
- **Integration tests**: Run integration tests (`npm run test:integration`)
- **Build**: Verify project builds successfully (`npm run build`)

**Manual hook execution:**
```bash
# Test pre-commit hooks manually
npx lefthook run pre-commit

# Test pre-push hooks manually
npx lefthook run pre-push
```

**Skipping hooks** (discouraged):
```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify

# Skip pre-push hooks (not recommended)
git push --no-verify
```

**Note**: All hooks must pass before your changes can be merged. If hooks fail, fix the issues and try again.

## Development Workflow

This project follows **Test-Driven Development (TDD)**. Always write tests first!

### 1. Create a Feature Branch

```bash
git checkout master
git pull upstream master
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Write Tests First (TDD - RED)

Create test files in the appropriate directory:
- Unit tests: `tests/tools/` or `tests/utils/`
- Integration tests: `tests/integration/`

```bash
# Example: Adding a new tool
# 1. Create test file first
touch tests/tools/my-new-tool.test.ts
touch tests/integration/my-new-tool.test.ts

# 2. Write failing tests
npm test  # Should fail (RED)
```

### 3. Implement the Feature (TDD - GREEN)

Write minimal code to make tests pass:

```bash
# Create implementation file
touch src/tools/my-new-tool.ts

# Implement feature
# Run tests until they pass
npm test  # Should pass (GREEN)
```

### 4. Refactor (TDD - REFACTOR)

Improve code quality while keeping tests green:

```bash
npm test        # Ensure tests still pass
npm run lint    # Check code quality
npm run format  # Auto-format code
npm run typecheck  # Verify types
```

### 5. Test Data Integrity

**CRITICAL**: All tools must be tested against actual JSON data from `@openstreetmap/id-tagging-schema`.

```typescript
// Import JSON data in your tests
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import fields from "@openstreetmap/id-tagging-schema/dist/fields.json" with { type: "json" };

// Validate against ALL values (100% coverage required)
describe("JSON Schema Data Integrity", () => {
  it("should validate against all presets", async () => {
    // Loop through ALL presets, not a sample
    for (const [presetId, preset] of Object.entries(presets)) {
      // Test each individually
      const result = await myTool(presetId);
      assert.ok(result);
    }
  });
});
```

**Requirements:**
- ✅ Validate EVERY value from JSON files
- ✅ Use provider patterns for comprehensive coverage
- ✅ No hardcoded test values
- ✅ Bidirectional validation (tool → JSON and JSON → tool)

## Pull Request Process

### Before Submitting

Run the full validation suite:

```bash
# 1. Run all tests
npm test

# 2. Check code quality
npm run lint

# 3. Verify TypeScript
npm run typecheck

# 4. Build project
npm run build
```

**All checks must pass before submitting a PR.**

### Creating a Pull Request

#### Automatic PR Creation (Claude Branches)

For branches with the `claude/*` prefix, Pull Requests are **automatically created** when you push:

```bash
# Push your claude branch
git push origin claude/add-new-feature-abc123

# ✅ A PR is automatically created!
# No need to manually create it on GitHub
```

The auto-PR workflow will:
- ✅ Detect the `claude/*` branch push
- ✅ Create a PR with title: `[CLAUDE] <first commit title>`
- ✅ Target the default branch (main/master)
- ✅ Include recent commits in the PR description
- ✅ Add labels: `auto-created`, `claude-branch`
- ✅ Skip creation if a PR already exists

**Branch naming format:** `claude/<feature-description>-<session-id>`

Example: `claude/add-tag-validation-01Y1fZwRf7bd`
- Session ID: `01Y1fZwRf7bd`
- First commit: "Add tag validation for OSM keys"
- **PR Title**: `[CLAUDE] Add tag validation for OSM keys`

**⚠️ Setup Required:**

The auto-PR workflow requires additional repository configuration. **Repository maintainers** must enable one of the following:

**Option 1: Enable GitHub Actions PR creation (Recommended)**
1. Go to **Settings** → **Actions** → **General** → **Workflow permissions**
2. Enable: ✅ **"Allow GitHub Actions to create and approve pull requests"**
3. Click **Save**

**Option 2: Use Personal Access Token (PAT)**
1. Create a PAT with `repo` scope at https://github.com/settings/tokens/new
2. Add it as repository secret named `PAT_TOKEN`

See `.github/workflows/README.md` for detailed setup instructions.

If auto-PR creation fails, you can still create PRs manually (see below).

#### Manual PR Creation (Other Branches)

For standard feature branches, create PRs manually:

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] All tests passing
   - [ ] Test coverage >90%

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Review Process

1. **Automated Checks**: GitHub Actions will run tests, linting, and type checking
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Coding Standards

### File Organization

**One Tool, One File**: Each MCP tool gets its own file.

```
src/tools/
├── my-new-tool.ts        # Implementation
tests/tools/
├── my-new-tool.test.ts   # Unit tests
tests/integration/
├── my-new-tool.test.ts   # Integration tests
```

### TypeScript Style

```text
// Use explicit types
export interface MyToolResult {
  data: string[];
  count: number;
}

// Use async/await
export async function myTool(
  loader: SchemaLoader,
  param: string,
): Promise<MyToolResult> {
  const data = await loader.getData();
  return { data, count: data.length };
}

// Use type guards
if ("fields" in preset && preset.fields) {
  // ...
}
```

### Code Quality Tools

- **BiomeJS**: Linting and formatting
- **TypeScript**: Type checking
- **Node.js Test Runner**: Testing

```bash
# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Run specific test file
node --import tsx --test tests/tools/my-tool.test.ts
```

### Dependency Version Pinning Policy

> **📖 For dependency automation (Renovate/Dependabot), see [dependency-management.md](./dependency-management.md)**

This project uses **tilde (`~`) version ranges for all dependencies** to ensure predictable updates:

- **Tilde (~)**: Restricts updates to patch-level only (e.g., `~1.25.0` allows `1.25.1` but not `1.26.0`)
- **Rationale**: Automatic security patches without unexpected breaking changes from minor versions
- **Behavior**: `1.25.0` → `1.25.1` ✅ | `1.25.0` → `1.26.0` ❌

**GitHub Actions** (SHA hash pinning):
```yaml
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4
```
- **SHA hashes**: Exact commit pinning for maximum security
- **Rationale**: Prevents supply chain attacks via compromised action versions
- **OpenSSF Best Practice**: Recommended by OpenSSF Scorecard

**When adding new dependencies:**
1. **Always use tilde (`~`)** for both production and dev dependencies
2. **Update package-lock.json**: Always commit the updated lockfile
3. **Run tests**: Ensure `npm test` passes with new versions
4. **Security check**: Run `npm audit` before committing

**CRITICAL RULE**: When updating dependencies, **ALWAYS maintain the tilde (`~`) prefix**:
- ✅ Correct: `"tsx": "~4.20.6"` → `"tsx": "~4.21.0"` (tilde preserved)
- ❌ Incorrect: `"tsx": "~4.20.6"` → `"tsx": "^4.21.0"` (changed to caret)
- ❌ Incorrect: `"tsx": "~4.20.6"` → `"tsx": "4.21.0"` (removed tilde)

**Updating dependencies:**
```bash
# Update to latest patch version
npm update @modelcontextprotocol/sdk

# Update package-lock.json
git add package-lock.json

# Verify everything works
npm test && npm run lint && npm run typecheck
```

**Rationale for this strategy:**
- ✅ **Security**: Automatic patch updates fix vulnerabilities
- ✅ **Stability**: No unexpected breaking changes from minor versions
- ✅ **Predictability**: Consistent behavior across all dependencies
- ✅ **CI/CD Safety**: `npm ci` uses package-lock.json for reproducible builds

## Testing Requirements

### Test Coverage

- **Minimum**: 90% coverage across all modules
- **Goal**: 100% coverage for critical paths

### Test Structure

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("MyTool", () => {
  describe("Basic Functionality", () => {
    it("should do X", async () => {
      // Arrange
      const input = "test";

      // Act
      const result = await myTool(input);

      // Assert
      assert.strictEqual(result.count, 1);
    });
  });

  describe("JSON Schema Data Integrity", () => {
    it("should validate against JSON data", async () => {
      // Test against actual schema data
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", async () => {
      // Test edge cases
    });
  });
});
```

### Integration Tests

```typescript
describe("Integration: my_new_tool", () => {
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
    const tool = response.tools.find((t) => t.name === "my_new_tool");
    assert.ok(tool);
  });
});
```

### Skipped Tests

**Status**: The project currently has 16 skipped integration tests for parameter validation.

**Why skipped**:
- Tests for parameter validation (missing/invalid parameters) are currently skipped
- The MCP SDK v1.21.1 uses Zod for schema validation
- When the MCP SDK migration to the new tool registration API is complete, these tests will be re-enabled or removed based on the new validation behavior

**Location**: All skipped tests are in `tests/integration/*.test.ts` files.

**Examples**:
```typescript
// Parameter validation tests (currently skipped)
it.skip("should throw error for missing tagKey parameter", async () => {
  await assert.rejects(
    async () => {
      await client.callTool({
        name: "get_tag_info",
        arguments: {},
      });
    },
    { message: /tagKey parameter is required/ }
  );
});
```

**What this means for contributors**:
- ✅ Unit tests and data integrity tests are comprehensive (406 total tests)
- ✅ All skipped tests are non-critical (parameter validation only)
- ✅ When adding new tools, you can follow the existing pattern of skipping parameter validation tests
- ✅ These tests will be addressed in a future MCP SDK migration

## Commit Message Guidelines

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc.)
- `chore`: Build process, dependencies

### Examples

```bash
# Good commit messages
git commit -m "feat(tools): add get_tag_relations tool"
git commit -m "fix(validation): handle empty tag collections"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(tools): add JSON data integrity tests"

# Bad commit messages (avoid these)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "update"
```

### Detailed Commit Body

For complex changes, use a detailed commit message:

```bash
git commit -m "$(cat <<'EOF'
feat(tools): add suggest_improvements tool (TDD)

**Feature**: suggest_improvements tool for analyzing tag collections

**TDD Approach**:
- RED: Created 14 unit tests for functionality
- GREEN: Implemented with preset matching
- REFACTOR: Fixed bugs, added type guards

**Implementation**:
- Created src/tools/suggest-improvements.ts
- Integrated with check_deprecated
- Returns matched preset IDs

**Tests**:
- Unit tests (13 tests)
- Integration tests (11 tests)
- All 370 tests passing
EOF
)"
```

## Documentation

### Code Documentation

Use JSDoc comments:

```typescript
/**
 * Get all possible values for a tag key
 *
 * @param loader - Schema loader instance
 * @param tagKey - The tag key to query (e.g., "amenity")
 * @returns Array of valid values sorted alphabetically
 */
export async function getTagValues(
  loader: SchemaLoader,
  tagKey: string,
): Promise<string[]> {
  // ...
}
```

### README Updates

When adding new tools, update:
- **README.md**: Add tool to the table
- **ROADMAP.md**: Mark task as completed
- **CHANGELOG.md**: Add entry in Unreleased section

### CLAUDE.md Updates

For significant features, update `CLAUDE.md`:
- Development Status section
- Test counts
- Phase completion status

## Release and Publishing

This section is for maintainers preparing a new release.

> **📖 For detailed release instructions, see [release-process.md](./release-process.md)**

### Quick Release Workflow

Releases are **fully automated** using [Release Please](https://github.com/googleapis/release-please) based on [Conventional Commits](https://www.conventionalcommits.org/).

**How it works:**

1. **Write commits** using Conventional Commits format:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update documentation"
   ```

2. **Merge to master** - Release Please automatically:
   - Analyzes commits since last release
   - Determines version bump (major/minor/patch)
   - Creates/updates release PR with CHANGELOG

3. **Review and merge** the release PR - Automatically triggers:
   - npm package publishing with provenance
   - Git tag creation
   - GitHub release creation
   - Docker image builds

**Commit types:**
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `docs:` - Documentation (patch version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (major version bump)

**Configuration:**
- `release-please-config.json` - Release Please configuration
- `.release-please-manifest.json` - Current version tracking

**For complete instructions**, including commit conventions and troubleshooting, see [release-process.md](./release-process.md)

### Pre-Publication Checklist

Before publishing a new version to npm:

1. **Ensure All Tests Pass**
   ```bash
   npm run test:unit        # Unit tests
   npm run test:integration # Integration tests
   npm run lint             # Code quality
   npm run typecheck        # TypeScript types
   npm run build            # Compile TypeScript
   ```

2. **Verify Package Contents**
   ```bash
   npm pack --dry-run       # Preview package contents
   ```

   Expected contents:
   - ✅ `dist/` directory (compiled code)
   - ✅ `docs/` directory (user documentation)
   - ✅ LICENSE, README.md, CHANGELOG.md
   - ✅ CONTRIBUTING.md, SECURITY.md
   - ❌ No `src/` directory (source code)
   - ❌ No `tests/` directory (test files)
   - ❌ No dev config files (biome.json, tsconfig.json)

3. **Update Version Number**
   ```bash
   # Update package.json version (manually or with npm version)
   npm version patch   # 0.1.0 → 0.1.1
   npm version minor   # 0.1.0 → 0.2.0
   npm version major   # 0.1.0 → 1.0.0
   ```

4. **Update CHANGELOG.md**
   - Move changes from [Unreleased] to new version section
   - Follow [Keep a Changelog](https://keepachangelog.com/) format
   - Add release date

5. **Create Git Tag**
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```

6. **Trigger Automated Publication**
   - GitHub Actions will automatically:
     - Run all tests and checks
     - Build the project
     - Generate SBOM (Software Bill of Materials)
     - Generate SLSA build provenance attestations
     - Generate SLSA SBOM attestations
     - Publish to npm with provenance
     - Create GitHub release with security information

### Manual Publication (if needed)

If automated publishing fails:

```bash
# Ensure you're on master branch with latest changes
git checkout master
git pull origin master

# Build the project
npm run build

# Publish with provenance
npm publish --provenance --access public
```

### NPM Provenance & Supply Chain Security

This package is published with comprehensive supply chain security features. Understanding these helps maintain trust and security.

#### What Gets Published

When a version tag is pushed, the automated workflow:

1. **Generates SBOM (Software Bill of Materials)**
   - CycloneDX format
   - Lists all dependencies with versions
   - Includes license information
   - Provides cryptographic hashes

2. **Creates SLSA Attestations**
   - **Build Provenance**: Links package to specific build
   - **SBOM Attestation**: Attests to SBOM authenticity
   - **SLSA Level 3**: Highest level of supply chain security
   - Non-falsifiable (signed by GitHub Actions)

3. **Publishes with NPM Provenance**
   - `--provenance` flag enabled in `.npmrc`
   - Cryptographic attestation linking package to source
   - Verifiable on npm package page
   - OIDC token from GitHub Actions

#### Verification Commands

After publication, verify everything worked correctly:

**Check NPM Provenance:**
```bash
# View provenance on npm package page
npm view @gander-tools/osm-tagging-schema-mcp dist.attestations

# Verify signatures
npm audit signatures
```

**Verify SLSA Attestations:**
```bash
# Install GitHub CLI if needed
gh auth login

# Verify attestations
gh attestation verify \
  oci://registry.npmjs.org/@gander-tools/osm-tagging-schema-mcp:0.1.0 \
  --owner gander-tools
```

**Check SBOM:**
```bash
# Download SBOM from GitHub release
gh release download v0.1.0 --pattern 'sbom.json'

# View contents
cat sbom.json | jq .
```

#### Security Requirements

**For Maintainers:**

- ✅ **2FA Enabled**: GitHub account must have 2FA
- ✅ **NPM Token**: Stored as `NPM_TOKEN` secret in repository
- ✅ **Write Access**: Only maintainers can push version tags
- ✅ **Protected Master**: Master branch protected from force pushes
- ✅ **OIDC Token**: GitHub Actions uses OIDC for npm authentication

**For CI/CD:**

- ✅ **Permissions**: Workflow uses minimal required permissions
- ✅ **Pinned Actions**: All GitHub Actions pinned to specific SHA
- ✅ **Isolated Build**: Runs on GitHub-hosted runners
- ✅ **Attestations**: Signed with GitHub's OIDC token

#### Troubleshooting Publication Issues

**Provenance Generation Failed:**
- Ensure `id-token: write` permission in workflow
- Verify GitHub Actions OIDC provider is configured
- Check npm token has automation permissions

**SLSA Attestation Failed:**
- Ensure `attestations: write` permission in workflow
- Verify tarball was created successfully
- Check SBOM generation completed

**NPM Publish Failed:**
- Verify `NPM_TOKEN` secret is set correctly
- Check npm token hasn't expired
- Ensure package version doesn't already exist
- Verify package.json version matches git tag

**For more details**, see [../deployment/security.md](../deployment/security.md)

### Docker Image Publishing

Docker images are automatically built and published to GitHub Container Registry (GHCR) by the `.github/workflows/publish-docker.yml` workflow.

#### Automated Build Triggers

**Master Branch Push:**
- Builds multi-architecture images (amd64, arm64)
- Tags: `edge` (bleeding edge development builds)

**Version Tag Push:**
- Triggered when pushing tags like `v1.0.0`
- Tags: `1.0.0`, `1.0`, `1`, `latest`

#### Image Tags

The following tags are created automatically:

| Tag | Description | Example | Recommended Use |
|-----|-------------|---------|-----------------|
| `edge` | Latest master branch | `ghcr.io/gander-tools/osm-tagging-schema-mcp:edge` | Development/Testing |
| `latest` | Latest stable release | `ghcr.io/gander-tools/osm-tagging-schema-mcp:latest` | Production (auto-update) |
| `X.Y.Z` | Specific patch version | `ghcr.io/gander-tools/osm-tagging-schema-mcp:0.2.1` | Production (pinned) |
| `X.Y` | Latest patch in minor | `ghcr.io/gander-tools/osm-tagging-schema-mcp:0.2` | Production (minor updates) |
| `X` | Latest minor in major | `ghcr.io/gander-tools/osm-tagging-schema-mcp:0` | Production (major version) |

**Note:** The `dev` tag has been replaced with `edge`. Short commit hash tags are no longer created.

#### Ensuring Images Are Public

**IMPORTANT:** By default, GitHub Container Registry packages are **private**. To make images publicly accessible:

1. **Navigate to Package Settings:**
   - Go to https://github.com/orgs/gander-tools/packages/container/osm-tagging-schema-mcp/settings
   - Or: Repository → Packages → osm-tagging-schema-mcp → Package settings

2. **Change Visibility:**
   - Scroll to "Danger Zone"
   - Click "Change visibility"
   - Select "Public"
   - Confirm the change

3. **Verify Public Access:**
   ```bash
   # Should work without authentication
   docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
   docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:edge
   ```

**Note:** This step only needs to be done once per package. All subsequent images will inherit the public visibility.

#### Security Features

Each Docker image includes:

- ✅ **Vulnerability Scanning**: Automated Trivy scanning for CRITICAL/HIGH severity issues
- ✅ **Image Signing**: Cosign keyless signatures with Sigstore
- ✅ **SARIF Reports**: Security scan results in GitHub Security tab
- ✅ **Verification**: Users can verify image authenticity

#### Webhook Notification for Latest Tag

When a Docker image with the `latest` tag is published (i.e., when a version tag like `v1.0.0` is pushed), a webhook notification can be sent to a configured endpoint.

**Setup:**

1. **Configure Webhook URL:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `DOCKER_PUBLISH_LATEST_WEBHOOK`
   - Value: Your webhook endpoint URL (e.g., `https://example.com/webhook`)

2. **Webhook Payload:**
   The webhook sends a POST request with JSON payload:
   ```json
   {
     "event": "docker_publish_latest",
     "repository": "gander-tools/osm-tagging-schema-mcp",
     "image": "ghcr.io/gander-tools/osm-tagging-schema-mcp",
     "tag": "latest",
     "version": "v1.0.0",
     "digest": "sha256:...",
     "commit": "abc123...",
     "timestamp": "2025-11-19T12:00:00Z",
     "actor": "github-username"
   }
   ```

3. **Webhook Headers:**
   - `Content-Type: application/json`
   - `User-Agent: GitHub-Actions`

**Testing:**

The webhook will only be sent when:
- A version tag is pushed (e.g., `v1.0.0`)
- The `latest` tag is created for the Docker image
- The secret `DOCKER_PUBLISH_LATEST_WEBHOOK` is configured

**Troubleshooting:**

- If the webhook secret is not set, the step will be skipped with a warning
- If the webhook returns HTTP status outside 200-299 range, the workflow will fail
- Check GitHub Actions logs for webhook delivery status

#### Verifying Docker Images

After images are published, verify security features:

**Verify Image Signature:**
```bash
cosign verify ghcr.io/gander-tools/osm-tagging-schema-mcp:latest \
  --certificate-identity-regexp=https://github.com/gander-tools \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

**Check Security Scan Results:**
- Navigate to: Repository → Security → Code scanning alerts
- Review Trivy vulnerability reports
- Ensure no CRITICAL or HIGH severity issues

**Pull Specific Commit:**
```bash
# Get current commit hash
COMMIT=$(git rev-parse --short HEAD)

# Pull image for specific commit
docker pull ghcr.io/gander-tools/osm-tagging-schema-mcp:$COMMIT
```

#### Troubleshooting Docker Builds

**Build Failed:**
- Check workflow logs in GitHub Actions
- Verify Dockerfile builds locally: `docker build -t test .`
- Ensure multi-arch build works: `docker buildx build --platform linux/amd64,linux/arm64 .`

**Image Push Failed:**
- Ensure `packages: write` permission in workflow
- Verify GITHUB_TOKEN has correct permissions
- Check if package name conflicts with existing package

**Signature Failed:**
- Ensure `id-token: write` permission in workflow
- Verify Cosign installation in workflow
- Check OIDC provider configuration

**Images Not Public:**
- Follow "Ensuring Images Are Public" steps above
- Verify package visibility in GitHub settings
- Test anonymous pull without docker login

### Post-Publication

1. **Verify Package**
   ```bash
   # Check package on npm
   npm view @gander-tools/osm-tagging-schema-mcp

   # Verify provenance
   npm audit signatures

   # Verify SLSA attestations
   gh attestation verify \
     oci://registry.npmjs.org/@gander-tools/osm-tagging-schema-mcp:latest \
     --owner gander-tools

   # Test installation
   npx @gander-tools/osm-tagging-schema-mcp@latest
   ```

2. **Update Documentation**
   - Ensure README.md badges show correct version
   - Update docs/ if needed for version-specific changes

3. **Announce Release**
   - GitHub release notes (auto-generated)
   - Optional: Social media announcement

## Questions?

- **Issues**: Open an issue on GitHub for questions
- **Discussions**: Use GitHub Discussions for broader topics
- **Security**: Email security issues privately (see SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0.
