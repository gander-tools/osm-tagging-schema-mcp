## Why

The `NPM Audit` job runs two audits with muddled scopes: a full audit (`moderate`, non-blocking) and a production audit via the deprecated `--production` flag (`high`, blocking). Production dependencies are what ships to users, so they get the strictest threshold; dev dependencies only affect CI and get a looser one, but must still stop the build.

## What Changes

- Production audit uses `npm audit --omit=dev --audit-level=moderate` (replaces deprecated `--production`, threshold tightened from `high` to `moderate`); it stays blocking.
- The audit that also covers dev dependencies uses `--audit-level=moderate` (unchanged threshold) and becomes blocking (`continue-on-error` removed).
- Steps are renamed so scope is clear: "production" vs "all dependencies (incl. dev)".
- Applied identically in `security-pr.yml` and `security-main.yml`.

## Capabilities

### New Capabilities
None. CI tooling only, so `skip_specs: true` is set.

### Modified Capabilities
None.

## Impact

- `.github/workflows/security-pr.yml`, `.github/workflows/security-main.yml` (the `npm-audit` job).
- A moderate+ advisory in a production dependency now fails PR and `master` security checks (previously only high+); a moderate+ advisory in any dependency, dev included, now fails them too (previously informational for dev).
- `npm audit` currently reports 0 vulnerabilities for both scopes, so no immediate CI breakage.
