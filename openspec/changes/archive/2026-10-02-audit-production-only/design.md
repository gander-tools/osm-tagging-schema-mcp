## Context

See proposal.md. `npm-audit` previously ran a non-blocking full audit and a blocking `--production` audit at `high`. npm 11.19.1 deprecates `--production` in favor of `--omit=dev`. `npm audit` has no dev-only mode (`--omit=prod` is rejected; valid values: dev, optional, peer). `security-main.yml` already has a daily cron (02:00 UTC) and the `npm-audit` job already runs on `schedule`.

## Goals / Non-Goals

**Goals:**
- Production audit blocks, with a non-deprecated flag.
- Dev advisories do not block PRs but are surfaced by the scheduled run.
- Package integrity is verified.

**Non-Goals:**
- No new cron or workflow (the existing daily schedule is reused).
- No dev-only audit tooling.

## Decisions

- **Levels** (npm: `low` fails on any advisory, `moderate` on moderate+, `high` on high+): production `high` (blocking), all-dependencies `moderate`.
- **Dev = full audit.** npm cannot audit dev only, so the dev-level check is the all-dependencies audit at `moderate`. Alternative: filter `npm audit --json` with a script - rejected as extra code.
- **Schedule check via `continue-on-error: ${{ github.event_name != 'schedule' }}`** on the full audit in `security-main.yml`: informational normally, failing on the daily run. Alternative: a separate scheduled workflow - rejected, it would duplicate the job.
- **`npm audit signatures`** added as a blocking step (verified working locally on the current lockfile).
- **Both workflows edited identically** (PR copy keeps the full audit informational).

## Risks / Trade-offs

- [A failing daily run for a dev-only advisory is noisy] -> only on new moderate+ advisories; fix via update or `overrides`.
- [`high` on production misses low/moderate advisories] -> accepted; the full audit still reports them at `moderate`.
- [`npm audit signatures` can fail on registry outages] -> re-run the job.
