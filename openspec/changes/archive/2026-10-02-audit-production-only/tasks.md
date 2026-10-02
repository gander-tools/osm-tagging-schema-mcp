## 1. Workflows

- [x] 1.1 In `security-pr.yml` set the production step to `npm audit --omit=dev --audit-level=low` and the all-dependencies step to `npm audit --audit-level=moderate`, both blocking (no `continue-on-error`); rename both steps; verify with `grep -n "npm audit" .github/workflows/security-pr.yml`
- [x] 1.2 Apply the identical change in `security-main.yml`; verify `grep -rn "\-\-production" .github` returns nothing for `npm audit`
- [x] 1.3 Verify `actionlint` passes (CI "Lint GitHub Actions Workflows" job green)

## 2. Verification

- [x] 2.1 Run `npm audit --omit=dev --audit-level=low` and `npm audit --audit-level=moderate` locally; verify both exit 0 with no deprecation warning
