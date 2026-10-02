## Context

See proposal.md. Today both `npm-audit` jobs run `npm audit --audit-level=moderate` (`continue-on-error`) and `npm audit --production --audit-level=high` (blocking). npm 11.19.1 warns that `--production` is deprecated in favor of `--omit=dev`. `npm audit` has no dev-only mode: `--omit=prod` is rejected (valid values: dev, optional, peer).

## Goals / Non-Goals

**Goals:**
- Production audit is the strictest (`low`) and blocking, using a non-deprecated flag.
- The audit including dev dependencies is looser (`moderate`) but blocking.

**Non-Goals:**
- No change to `npm ci`, the npm pin, SBOM, license, or other security jobs.
- No new dev-only audit tooling.

## Decisions

- **Levels** (npm: `low` fails on any advisory, `moderate` on moderate+, `high` on high+): prod `low`, all-dependencies `moderate`. Dev is looser than prod, prod is the tightest possible.
- **"dev" = full audit.** npm has no dev-only audit (`--omit=prod` is rejected), so the dev-level check is the all-dependencies audit (prod + dev) at `moderate`. Alternative: filter `npm audit --json` for dev-only advisories with a script - rejected as extra code for no gain.
- **`--omit=dev` replaces `--production`.** Same behavior, no deprecation warning.
- **Both steps blocking.** `continue-on-error` removed from the full audit.
- **Both workflows edited identically** to avoid drift between PR and `master` checks.

## Risks / Trade-offs

- [`low` on production and blocking `moderate` on dev can fail PRs on transitive advisories] -> currently 0 findings; fix via update or `overrides` in `package.json`.
- [Dev advisories now block releases/PRs] -> intentional per request; relax by raising the dev threshold to `high`.
