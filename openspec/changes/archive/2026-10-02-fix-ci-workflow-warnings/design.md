## Context

See proposal.md. All edits are small and independent; no runtime code is touched. Biome is run by `npm run lint`, so the `biome.json` change is verifiable locally; workflow changes are verified with actionlint (already a CI job).

## Goals / Non-Goals

**Goals:**
- Clean run logs: no unexpected-input warning, no webhook error, no Biome deprecation notice, no empty-artifact warning.

**Non-Goals:**
- Fixing the `ubuntu-latest` migration notice, npm transitive deprecation warnings, Scorecard SARIF URI warnings (upstream/known).

## Decisions

- **Webhook: delete, don't disable.** The receiver is gone, so keeping the step (even guarded by secrets) leaves dead code and docs. Alternative (leave it, rely on skip-when-secret-missing) rejected because the secrets are still set and the step errors.
- **`omitArtifactsDuringUpdate`: remove.** Without an `artifacts` input the action does not touch artifacts on update, so the intent is already met.
- **Biome: `recommended: true` → `preset: "recommended"`** per the Biome deprecation message; confirm exact accepted value against the installed Biome version via `npm run lint`.
- **Fuzz upload: drop `coverage/` from `path`**, keep `.fuzz-results/` and add `if-no-files-found: ignore` so an empty fuzz run does not warn either.

## Risks / Trade-offs

- [Biome `preset` key unsupported by pinned version] → run `npm run lint` before committing; keep `recommended` if rejected.
- [Removing webhook loses a notification someone still relies on] → user confirmed the receiver no longer exists.
