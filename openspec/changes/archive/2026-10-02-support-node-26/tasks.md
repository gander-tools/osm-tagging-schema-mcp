## 1. Install Node 26 locally

- [x] 1.1 Run `nvm install 26` and verify `node -v` prints v26.x and `npm -v` prints 11.19.x

## 2. Package and runtime config

- [x] 2.1 Set `engines.node` to `^24.0.0 || ^26.0.0` in `package.json`; verify with `grep -n '"node"' package.json`
- [x] 2.2 Set `.nvmrc` to `26`; verify `cat .nvmrc`
- [x] 2.3 Bump `@types/node` to `~26.x` (tilde kept) and refresh `package-lock.json`; verify `npm ci` and `npm run typecheck` pass on Node 26

## 3. GitHub Actions

- [x] 3.1 Set `node-version: '26'` in all 14 `setup-node` steps; verify `grep -rn "node-version" .github` shows only `'26'` (plus the matrix reference)
- [x] 3.2 Replace `npm@11.12.1` with `npm@11.19.1` in all workflows; verify `grep -rn "11.12.1" .github` returns nothing
- [x] 3.3 Add `strategy: { fail-fast: false, matrix: { node: [26, 24] } }` to the `test` job in `test.yml`, using `node-version: ${{ matrix.node }}`; verify `actionlint` passes
- [x] 3.4 Update the "Node 24" wording in `.github/scorecard.yml` and workflow comments; verify `grep -rn "Node 24\|Node.js 24" .github` has only intentional hits

## 4. Docker and fuzzing images

- [x] 4.1 Fetch the current `node:26-alpine` digest and update both `FROM` lines and the refresh comments in `Dockerfile`; verify `docker build .` succeeds
- [x] 4.2 Change `.ossfuzz/Dockerfile` to `node_26.x`; verify the file diff is limited to that URL
- [x] 4.3 Restrict Docker publishing to `linux/amd64` (`platforms` in `publish-docker.yml`, platforms table, Dockerfile comments, `CLAUDE.md`); verify `grep -rn arm64 .github Dockerfile CLAUDE.md` returns nothing

## 5. Docs and config text

- [x] 5.1 Update `CLAUDE.md` (runtime section, GitHub Actions requirement #3) and `openspec/config.yaml` (stack and CI lines) to "24 || 26 / Node 26"; verify no stale "22" remains via `grep -rn "Node.js 22\|22/24" CLAUDE.md openspec/config.yaml`

## 6. Verification

- [x] 6.1 On Node 26 run `npm run test:unit`, `npm run test:integration`, `npm run typecheck`, `npm run lint`, `npm run build`; all pass
- [x] 6.2 On Node 24 (`nvm use 24`) run `npm run test:unit` and `npm run test:integration`; both pass
