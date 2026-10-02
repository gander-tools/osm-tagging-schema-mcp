## Why

The `NPM Audit` job runs two audits with muddled scopes: a full audit (`moderate`, non-blocking) and a production audit via the deprecated `--production` flag (`high`, blocking). Production dependencies ship to users and should gate PRs; dev dependencies only affect CI and should not block unrelated PRs, but must not go unnoticed as new advisories appear.

## What Changes

- Production audit uses `npm audit --omit=dev --audit-level=high` (replaces deprecated `--production`); blocking.
- The audit that also covers dev dependencies uses `--audit-level=moderate`; informational (`continue-on-error`) on PR, push and manual runs, and failing on the existing daily schedule in `security-main.yml` so new advisories surface as a failed run.
- New `npm audit signatures` step verifies registry signatures and provenance; blocking.
- Steps are renamed so scope is clear. Applied in `security-pr.yml` and `security-main.yml`.

## Capabilities

### New Capabilities
None. CI tooling only, so `skip_specs: true` is set.

### Modified Capabilities
None.

## Impact

- `.github/workflows/security-pr.yml`, `.github/workflows/security-main.yml` (the `npm-audit` job).
- Dev-only advisories no longer block PRs; a failing daily scheduled run reports them instead.
- `npm audit` and `npm audit signatures` currently report no findings, so no immediate CI breakage.
