## Context

See proposal.md for motivation. Current state: all workflows pin `'24'`, Docker images use `node:24-alpine@sha256:...`, npm is pinned to 11.12.1 after `setup-node`. No lockfile dependency rejects Node 26 (checked `engines` of every package in `package-lock.json`); only the root `engines` does. Source uses no Node-version-specific APIs beyond `import.meta.resolve` (Node 20.6+). Node 26.10.0 bundles npm 11.19.1.

## Goals / Non-Goals

**Goals:**
- Primary toolchain (CI, release, Docker, fuzz) runs on 26.
- 24 stays verified by CI, not just declared.

**Non-Goals:**
- No source changes unless Node 26 reveals a failure.
- No Node 26 matrix in jobs beyond unit/integration tests.
- No change to the tilde range policy or action SHA pinning.

## Decisions

- **Explicit `node-version: '26'` everywhere** - requested; avoids relying on runner defaults. Alternative: `node-version-file: .nvmrc` (single source) - rejected, user wants the value visible in each action.
- **npm 11.19.1 pin** - matches Node 26.10.0's bundled npm, keeping the "explicit npm version" rule without downgrading. Alternatives: keep 11.12.1 (downgrade), drop the pin (breaks the rule and `publish --provenance` reproducibility).
- **Matrix only on `test` job (unit + integration)** - cheapest way to back the `^24` claim. `fail-fast: false` so a 24 failure does not hide a 26 result. Other jobs (MCP test, fuzz, security, release, Docker) are 26 only.
- **`engines.node: ^24.0.0 || ^26.0.0`** - drops 22, adds 26.
- **Docker digest** - resolve current `node:26-alpine` digest at implementation time (was `sha256:0b36e8c1...` on 2026-09-22) and update both `FROM` lines and the refresh-command comments.
- **Docker platforms: amd64 only** - requested; `publish-docker.yml` `platforms` and the platforms table, Dockerfile comments and CLAUDE.md updated. Alternative: keep amd64+arm64 (the 26-alpine image supports both) - rejected by the user.
- **`@types/node` `~26.x`** - matches the primary toolchain; typecheck on 24 is not run separately.

## Risks / Trade-offs

- [Types describe Node 26 APIs missing on 24] -> low impact at `target: ES2022`; the 24 matrix leg runs tests, not a separate typecheck.
- [Node 26 not yet LTS] -> Docker/runtime on a Current line; accept per request, 24 remains the compatibility floor.
- [Dependency fails on 26 at runtime] -> caught by the 26 test leg before merge.
- [Docker image digest drift] -> digest refreshed in this change; Renovate keeps it current afterwards.
