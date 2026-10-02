## Why

Workflow runs on 2026-10-02 surfaced warnings and one error annotation that point at dead or misconfigured CI. The Docker publish webhook receiver no longer exists, so the step fails with HTTP 500 on every release; the other findings are an ignored action input, a deprecated Biome option and an artifact upload that always warns.

## What Changes

- `publish-npm.yml`: remove the unsupported `omitArtifactsDuringUpdate` input from the `ncipollo/release-action` update step (v1.21.0 does not define it, so it was silently ignored).
- `publish-docker.yml`: remove the obsolete "Send webhook for latest tag publication" step and its `DOCKER_PUBLISH_LATEST_WEBHOOK` / `GANDER_TOOLS__CF_ACCESS_CLIENT_ID` / `GANDER_TOOLS__CF_ACCESS_CLIENT_SECRET` usage.
- `docs/development/contributing.md`: remove the "Webhook Notification for Latest Tag" section.
- `biome.json`: replace the deprecated `linter.rules.recommended` field with `preset`.
- `fuzz.yml`: stop warning about the missing `coverage/` path in "Upload fuzzing results".

## Capabilities

### New Capabilities
<!-- None: CI/tooling only -->

### Modified Capabilities
<!-- None: no spec-level behavior changes; change sets skip_specs -->

## Impact

- `.github/workflows/publish-npm.yml`, `.github/workflows/publish-docker.yml`, `.github/workflows/fuzz.yml`
- `biome.json`, `docs/development/contributing.md`
- No runtime, API or dependency changes. The unused repository secrets can be deleted manually afterwards.
