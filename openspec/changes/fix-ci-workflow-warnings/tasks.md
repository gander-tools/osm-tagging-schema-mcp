## 1. Workflow fixes

- [x] 1.1 Remove `omitArtifactsDuringUpdate` from the update step in `.github/workflows/publish-npm.yml`; verify `grep -rn omitArtifactsDuringUpdate .github` returns nothing
- [x] 1.2 Remove the "Send webhook for latest tag publication" step from `.github/workflows/publish-docker.yml`; verify `grep -rniE "webhook|CF_ACCESS" .github` returns nothing
- [x] 1.3 In `.github/workflows/fuzz.yml` drop `coverage/` from "Upload fuzzing results" and add `if-no-files-found: ignore`; verify the YAML is valid
- [ ] 1.4 Run actionlint (`npx`/CI Actionlint job) and verify no new findings

## 2. Tooling and docs

- [x] 2.1 Replace `recommended` with `preset` in `biome.json`; verify `npm run lint` passes with no deprecation notice
- [x] 2.2 Remove the "Webhook Notification for Latest Tag" section from `docs/development/contributing.md` and the webhook mentions in `docs/deployment/docker-on-demand.md`; verify no remaining webhook references via grep

## 3. Wrap-up

- [x] 3.1 Run `npm run lint`, `npm run typecheck`, `npm run build`; verify all pass, then open the PR from `fix/ci-workflow-warnings`
