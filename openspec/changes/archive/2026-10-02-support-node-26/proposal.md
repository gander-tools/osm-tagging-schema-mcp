## Why

Node.js 26 is the current release line (26.10.0, bundles npm 11.19.1) and the project still declares `^22 || ^24`. Node 22 is no longer worth supporting, and the CI/Docker toolchain should move to the newest line while staying compatible with the 24 LTS.

## What Changes

- `engines.node` becomes `^24.0.0 || ^26.0.0` (Node 22 dropped - **BREAKING** for Node 22 users).
- Every `actions/setup-node` step (14 across 8 workflows) sets an explicit `node-version: '26'`, even where it would be the default.
- Every `npm install -g npm@11.12.1` step becomes `npm@11.19.1` (the npm bundled with Node 26.10.0, so no silent downgrade).
- `test.yml` unit/integration job runs a matrix `[26, 24]` to keep the 24 compatibility claim verified; all other jobs run on 26 only.
- `Dockerfile` (builder + runtime) moves to `node:26-alpine` with a refreshed digest, and the published image becomes single-arch `linux/amd64` (arm64 dropped); `.ossfuzz/Dockerfile` moves to `node_26.x`.
- `.nvmrc` -> `26`; `@types/node` -> `~26.x` (tilde kept).
- Docs/config text updated: `CLAUDE.md`, `openspec/config.yaml`, `.github/scorecard.yml` comment.

## Capabilities

### New Capabilities
None. No spec-level behavior changes (tooling and runtime support only), so `skip_specs: true` is set.

### Modified Capabilities
None.

## Impact

- `package.json`, `package-lock.json`, `.nvmrc`
- `.github/workflows/{test,fuzz,security-main,security-pr,publish-npm,publish-docker,prepare-release}.yml`, `.github/scorecard.yml`
- `Dockerfile`, `.ossfuzz/Dockerfile`
- `CLAUDE.md`, `openspec/config.yaml`
- Container users get Node 26 at runtime and arm64 images are no longer published (**BREAKING** for arm64 hosts); npm consumers on Node 22 are no longer supported.
