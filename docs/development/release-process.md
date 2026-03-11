# Release Process

This document describes the 3-step manual release workflow using GitHub Actions and git-cliff for CHANGELOG generation.

## Overview

The release process uses three manually triggered workflows:

1. **Prepare Release** — bumps version, generates CHANGELOG, opens PR
2. **Publish NPM** — builds, tests, publishes to npm, creates git tag and GitHub release
3. **Docker Build and Publish** — builds and pushes multi-arch Docker images

**Key benefits:**
- ✅ Full control over when releases happen
- ✅ No version regression risk (you specify the version explicitly)
- ✅ Automatic CHANGELOG generation from Conventional Commits (via git-cliff)
- ✅ Consistent release quality (tests must pass before publishing)

## Prerequisites

- Write access to the repository (for running workflows and merging PRs)
- Understanding of [Conventional Commits](https://www.conventionalcommits.org/) (used by git-cliff for CHANGELOG)

## Conventional Commits

All commits to the master branch should follow the Conventional Commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

git-cliff uses these commit types to generate CHANGELOG sections:

| Type | Description | Appears in CHANGELOG |
|------|-------------|---------------------|
| `feat:` | New feature | ✅ Features |
| `fix:` | Bug fix | ✅ Bug Fixes |
| `perf:` | Performance improvement | ✅ Performance Improvements |
| `revert:` | Revert previous commit | ✅ Reverts |
| `docs:` | Documentation only | ✅ Documentation |
| `refactor:` | Code refactoring | ✅ Code Refactoring |
| `style:` | Code style changes | ❌ Hidden |
| `test:` | Test changes | ❌ Hidden |
| `build:` | Build system changes | ❌ Hidden |
| `ci:` | CI/CD changes | ❌ Hidden |
| `chore:` | Miscellaneous changes | ❌ Hidden |

### Breaking Changes

To document a **Major** version bump (X.0.0), use the `!` marker or `BREAKING CHANGE:` in the footer:

```
feat!: redesign validate_tag API

BREAKING CHANGE: validate_tag now returns a structured object instead of boolean
```

### Examples

**Feature:**
```bash
git commit -m "feat: add search_tags tool for keyword-based tag search"
```

**Bug fix:**
```bash
git commit -m "fix: handle undefined values in tag validation"
```

**Documentation:**
```bash
git commit -m "docs: update installation guide with Docker instructions"
```

**Breaking change:**
```bash
git commit -m "feat!: change validate_tag return format

BREAKING CHANGE: validate_tag now returns { valid: boolean, issues: string[] } instead of boolean"
```

## Release Workflow

### Step 1: Run "Prepare Release" Workflow

1. Go to **Actions → Prepare Release → Run workflow**
2. Enter the version number (e.g., `3.8.0`) — no `v` prefix
3. Click **Run workflow**

The workflow will:
- Validate the version format (`x.y.z`)
- Create branch `release/X.Y.Z`
- Bump version in `package.json` and `package-lock.json`
- Generate new CHANGELOG entries via git-cliff (`--unreleased`)
- Commit and push the branch
- Open a PR: **"chore(release): vX.Y.Z"** targeting master

### Step 2: Review and Merge the PR

The PR contains:
- 📝 Updated `package.json` version
- 📝 Updated `package-lock.json` version
- 📝 Updated `CHANGELOG.md` with all unreleased commits

**Review:**
1. Check version number is correct
2. Review CHANGELOG entries — ensure all important changes are documented
3. Merge the PR to master

### Step 3: Run "Publish NPM" Workflow

After merging the PR:

1. Go to **Actions → Publish NPM → Run workflow**
2. Enter the same version number (e.g., `3.8.0`)
3. Click **Run workflow**

The workflow will:
1. ✅ Validate the version format
2. ✅ Generate `src/version.json` with version and build timestamp
3. ✅ Verify `package.json` version matches the input (fails if not — run Prepare Release first)
4. ✅ Run all tests (unit, integration, type checking, linting, build)
5. ✅ Generate SBOM (Software Bill of Materials)
6. ✅ Create npm package tarball
7. ✅ Generate SLSA Level 3 build provenance attestation
8. ✅ Generate SLSA SBOM attestation
9. ✅ Publish to npm with provenance (Trusted Publishers / OIDC)
10. ✅ Upload `dist/` artifact for Docker builds
11. ✅ Create `dist.tar.gz` and attach to GitHub release
12. ✅ Create or update GitHub release with version tag `vX.Y.Z`

### Step 4: Run "Docker Build and Publish" Workflow

1. Go to **Actions → Docker Build and Publish → Run workflow**
2. Select `build_type` = `release`
3. Enter the same version number (e.g., `3.8.0`)
4. Click **Run workflow**

The workflow will:
1. ✅ Download `dist.tar.gz` from the GitHub release (same artifact as npm)
2. ✅ Build multi-arch Docker images (amd64/arm64)
3. ✅ Push to GitHub Container Registry (ghcr.io) with version tag and `latest`
4. ✅ Run Trivy vulnerability scanning
5. ✅ Sign image with Cosign (keyless signatures)

### Done!

After all three workflows complete, the release is live:
- 📦 npm package: https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp
- 🐳 Docker images: https://github.com/gander-tools/osm-tagging-schema-mcp/pkgs/container/osm-tagging-schema-mcp
- 🏷️ Git tag created: `vX.Y.Z`
- 📋 GitHub release: https://github.com/gander-tools/osm-tagging-schema-mcp/releases

## Version Strategy

Choose the version number following **semantic versioning**:

| Changes | Version Bump | Example |
|---------|--------------|---------|
| Only `fix:`, `docs:`, `refactor:` | **Patch** | 1.0.0 → 1.0.1 |
| At least one `feat:` | **Minor** | 1.0.0 → 1.1.0 |
| Any commit with `BREAKING CHANGE:` or `!` | **Major** | 1.0.0 → 2.0.0 |

**IMPORTANT:** Only commits with explicit breaking change markers (`!` or `BREAKING CHANGE:`) warrant major version bumps.

## Troubleshooting

### Version mismatch in "Publish NPM"

**Cause:** `package.json` version does not match the version entered in the workflow input.

**Solution:** Run the **Prepare Release** workflow first to bump `package.json` and merge the resulting PR before running Publish NPM.

### CHANGELOG missing entries

**Cause:** Commits use hidden types (`test:`, `chore:`, `ci:`, etc.)

**Solution:** Use visible types for user-facing changes:
- Use `fix:` instead of `chore:` for bug fixes
- Use `feat:` instead of `chore:` for new features
- Use `docs:` for documentation changes

### Publishing failed

**Check GitHub Actions logs:**
1. Go to **Actions** tab
2. Find the failed **Publish NPM** workflow run
3. Review error logs
4. Common issues:
   - Tests failing
   - Build errors
   - npm authentication issues

**Fix:**
1. Fix the issue in a new PR and merge to master
2. Re-run **Publish NPM** workflow

### Need to undo a release

**If release PR not yet merged:**
- Close the PR and delete the `release/X.Y.Z` branch

**If release already published:**
- ⚠️ **Cannot unpublish npm packages** (npm policy)
- Publish a new patch version with fixes

### Docker release exists but image is missing

Run **Docker Build and Publish** manually:
1. Go to **Actions → Docker Build and Publish → Run workflow**
2. Select `build_type=release`, enter the version
3. The workflow downloads `dist.tar.gz` from the existing GitHub release

## Comparison: Old vs New Process

### Old Process (Release Please — removed)
1. Write conventional commits
2. Merge to master
3. Release Please automatically creates a release PR
4. Merge the release PR — triggers auto-publish
- **Problem**: Version regressions (returned to 3.1.0 instead of 3.7.x)

### New Process (3-step manual workflow)
1. Run **Prepare Release** with explicit version
2. Review and merge PR
3. Run **Publish NPM** with same version
4. Run **Docker Build and Publish** with same version
- **Benefit**: Full version control, no regressions

## Tools

- **git-cliff**: CHANGELOG generation from Conventional Commits
- **Conventional Commits**: Commit message standard
  - Documentation: https://www.conventionalcommits.org/
- **GitHub Actions**: CI/CD automation
  - `prepare-release.yml`: Creates release branch and PR
  - `publish-npm.yml`: Builds and publishes to npm
  - `publish-docker.yml`: Docker image publishing (manual trigger)
- **npm Trusted Publishers**: Secure publishing with OIDC authentication
- **SLSA Attestations**: Supply chain security

## Best Practices

1. **Write meaningful commit messages**: CHANGELOG is generated from commits
2. **Use correct commit types**: Determines CHANGELOG section
3. **Include descriptions**: Helps users understand changes
4. **One logical change per commit**: Makes CHANGELOG clearer
5. **Document breaking changes**: Always include `BREAKING CHANGE:` explanation
6. **Review release PRs**: Check version and CHANGELOG before merging

## Related Documentation

- [contributing.md](./contributing.md) - Contribution guidelines (includes commit conventions)
- [CHANGELOG.md](../../CHANGELOG.md) - Version history
- [security.md](../deployment/security.md) - Security and provenance documentation
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message standard
