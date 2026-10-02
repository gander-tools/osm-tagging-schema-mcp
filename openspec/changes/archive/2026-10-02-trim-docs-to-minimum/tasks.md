## 1. Remove documentation

- [x] 1.1 Delete the `docs/` directory; verify `ls docs` fails and `grep -rn "docs/" . --include='*.md' --include='*.json' --include='*.yml' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=openspec --exclude=CHANGELOG.md` lists only references handled in later tasks
- [x] 1.2 Rewrite `README.md` to badges, what it is / is not, `claude mcp add` (npx and Docker), HTTP transport note (env vars and health endpoints, checked against `src/index.ts`), and the coverage tables with prose; verify no link points to `docs/`
- [x] 1.3 Remove the three `docs/deployment/security.md` links from `SECURITY.md`; verify with grep

## 2. Clean up references

- [x] 2.1 Remove `docs/**/*` and `CONTRIBUTING.md` from `files` in `package.json`; verify `npm pack --dry-run` succeeds and lists no `docs/`
- [x] 2.2 Remove `docs/` rules from `.github/labeler.yml` and the `docs/**` filter from `.github/workflows/test.yml`; verify YAML parses and grep finds no `docs/`
- [x] 2.3 Trim documentation sections and the `docs/api/` step from `CLAUDE.md`; verify grep finds no `docs/` and the Adding New Tools list is still coherent

## 3. Wrap-up

- [x] 3.1 Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`; verify all pass
