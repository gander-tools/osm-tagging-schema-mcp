## Why

The `docs/` tree (28 files, ~12,900 lines) duplicates what MCP clients already get from the server (`tools/list` is served from `src/metadata.ts`) and what `README.md` and `CLAUDE.md` already say. It is costly to keep in sync and, in practice, not read. Documentation should shrink to the minimum a new user needs.

## What Changes

- **BREAKING (docs only)**: delete the whole `docs/` directory.
- `README.md` keeps only: badges, what the project is / is not, `claude mcp add` commands for npx and Docker, a short HTTP transport note (env vars `TRANSPORT`, `HOST`, `PORT`, `CORS_ORIGINS`, `LOG_LEVEL`; `/health`, `/ready`, `/version` endpoints), and a single "What works and what doesn't" table (per-tool works / limitations, no reference to the tested image or snapshot). Remove Features, Claude Desktop config, Inspector, Development, Contributing and Documentation sections and every link into `docs/`.
- `SECURITY.md` stays; remove its three links to `docs/deployment/security.md`.
- `package.json`: drop `docs/**/*` and the non-existent `CONTRIBUTING.md` from `files`.
- `.github/labeler.yml`: drop `docs/` rules; `.github/workflows/test.yml`: drop the `docs/**` path filter.
- `CLAUDE.md`: remove the "Documentation Structure", "Documentation Update Workflow" and "Documentation Maintenance" sections and the "add API docs in `docs/api/`" step for new tools; keep the rest (TDD, architecture, testing standards).
- `CHANGELOG.md` is kept (generated at release).

## Capabilities

### New Capabilities
<!-- None: documentation and repo housekeeping only -->

### Modified Capabilities
<!-- None: no spec-level behavior changes; change sets skip_specs -->

## Impact

- Removes `docs/` from the published npm package (smaller tarball).
- Touches `README.md`, `SECURITY.md`, `CLAUDE.md`, `package.json`, `.github/labeler.yml`, `.github/workflows/test.yml`.
- No runtime, API or dependency changes. Contributor/release/fuzzing/deployment guides disappear; the HTTP transport note in the README is the only deployment information kept.

## Assumptions

- `design.md` is deliberately skipped: the change is deletion plus link cleanup with no design choices.
- The two README coverage tables and their prose are merged into one summary table; test methodology and `edge` references are dropped.
