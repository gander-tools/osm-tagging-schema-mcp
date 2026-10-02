## 1. Workflows

- [x] 1.1 In `security-pr.yml` set the production step to `npm audit --omit=dev --audit-level=high` (blocking), the all-dependencies step to `npm audit --audit-level=moderate` with `continue-on-error: true`, and add `npm audit signatures`; verify with `grep -n "npm audit" .github/workflows/security-pr.yml`
- [x] 1.2 Apply the same in `security-main.yml`, with `continue-on-error: ${{ github.event_name != 'schedule' }}` on the all-dependencies step; verify `grep -rn "\-\-production" .github` returns nothing for `npm audit`
- [x] 1.3 Verify `actionlint` passes (CI "Lint GitHub Actions Workflows" job green)

## 2. Verification

- [x] 2.1 Run `npm audit --omit=dev --audit-level=high`, `npm audit --audit-level=moderate` and `npm audit signatures` locally; verify all exit 0 with no deprecation warning
