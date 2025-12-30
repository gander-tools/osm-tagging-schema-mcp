# Release Process

This document describes the automated release workflow using Release Please and Conventional Commits.

## Overview

The release process is **fully automated** using [Release Please](https://github.com/googleapis/release-please):

1. **Developers** - Write commits following [Conventional Commits](https://www.conventionalcommits.org/) format
2. **Release Please** - Automatically creates/updates release PR based on commits
3. **Merge Release PR** - Triggers automatic npm publish, Docker builds, and GitHub release
4. **Done!** - Package is live, tags created, CHANGELOG updated

**Key benefits:**
- ✅ Zero manual release steps
- ✅ Automatic version bumping based on commit types
- ✅ Automatic CHANGELOG generation
- ✅ Automatic tagging and publishing
- ✅ Consistent release quality

**Manual release options:**
- 🚀 Complete manual release creation via GitHub CLI
- 🌐 Manual release via GitHub Web Interface
- 🚨 Emergency hotfix release procedures
- 🧪 Pre-release version management

## Prerequisites

- Git configured with your credentials
- Write access to the repository (for merging release PRs)
- Understanding of [Conventional Commits](https://www.conventionalcommits.org/)

## Conventional Commits

All commits to the master branch should follow the Conventional Commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

Release Please recognizes these commit types:

| Type | Description | Version Bump | Appears in CHANGELOG |
|------|-------------|--------------|---------------------|
| `feat:` | New feature | **Minor** (0.X.0) | ✅ Features |
| `fix:` | Bug fix | **Patch** (0.0.X) | ✅ Bug Fixes |
| `perf:` | Performance improvement | **Patch** (0.0.X) | ✅ Performance Improvements |
| `revert:` | Revert previous commit | **Patch** (0.0.X) | ✅ Reverts |
| `docs:` | Documentation only | **Patch** (0.0.X) | ✅ Documentation |
| `refactor:` | Code refactoring | **Patch** (0.0.X) | ✅ Code Refactoring |
| `style:` | Code style changes | **Patch** (0.0.X) | ❌ Hidden |
| `test:` | Test changes | **Patch** (0.0.X) | ❌ Hidden |
| `build:` | Build system changes | **Patch** (0.0.X) | ❌ Hidden |
| `ci:` | CI/CD changes | **Patch** (0.0.X) | ❌ Hidden |
| `chore:` | Miscellaneous changes | **Patch** (0.0.X) | ❌ Hidden |

**Note:** None of these commit types alone can trigger a **Major** version bump. Major bumps require explicit breaking change markers (see below).

### Breaking Changes

To trigger a **Major** version bump (X.0.0), you **must** include `BREAKING CHANGE:` in the commit footer or use the `!` marker:

```
feat: new API for tag validation

BREAKING CHANGE: validate_tag now returns a structured object instead of boolean
```

Or use the `!` marker:

```
feat!: redesign validate_tag API
```

### Examples

**Feature (minor version bump):**
```bash
git commit -m "feat: add search_tags tool for keyword-based tag search"
```

**Bug fix (patch version bump):**
```bash
git commit -m "fix: handle undefined values in tag validation"
```

**Documentation (patch version bump):**
```bash
git commit -m "docs: update installation guide with Docker instructions"
```

**Breaking change (major version bump):**
```bash
git commit -m "feat!: change validate_tag return format

BREAKING CHANGE: validate_tag now returns { valid: boolean, issues: string[] } instead of boolean"
```

**Multiple commits in one PR:**
```bash
git commit -m "feat: add get_preset_details tool"
git commit -m "test: add tests for get_preset_details"
git commit -m "docs: document get_preset_details API"
# Release Please will detect the feat: and bump minor version
```

## Release Workflow

### Manually Triggering Release Please for Specific Version

Sometimes you need Release Please to create a release for a specific version number rather than its automatically calculated version. Here's how to force Release Please to create the release you want:

#### When to Force Specific Versions

**Version alignment:**
- Synchronize with external dependencies
- Match semantic versioning requirements
- Align with marketing/business release schedules

**Version corrections:**
- Fix incorrectly calculated version bumps
- Skip version numbers for consistency
- Force major version bumps when Release Please calculates minor

**Emergency scenarios:**
- Hotfix releases requiring specific version numbers
- Security patches requiring immediate specific versions

#### Option 1: Modify Release Please Manifest

**Force specific version by updating manifest:**

1. **Check current Release Please state:**
   ```bash
   # View current version in manifest
   cat .release-please-manifest.json
   # Output: { ".": "3.7.0" }

   # Check what Release Please would calculate
   git log --oneline --since="$(git describe --tags --abbrev=0)"
   ```

2. **Manually set desired version:**
   ```bash
   # Force specific version in manifest
   DESIRED_VERSION="4.0.0"  # Your target version

   # Update manifest file
   echo "{ \".\": \"$DESIRED_VERSION\" }" > .release-please-manifest.json

   # Commit the manifest change
   git add .release-please-manifest.json
   git commit -m "chore: force release please to version $DESIRED_VERSION"
   git push origin master
   ```

3. **Trigger Release Please workflow:**
   ```bash
   # Option A: Add workflow_dispatch to release-please.yml first
   # Then trigger manually:
   gh workflow run release-please.yml --ref master

   # Option B: Force trigger with empty commit
   git commit --allow-empty -m "chore: trigger release please for v$DESIRED_VERSION"
   git push origin master
   ```

#### Option 2: Coordinate with Package.json Version

**Sync Release Please with package.json version:**

1. **Update package.json to target version:**
   ```bash
   DESIRED_VERSION="4.0.0"

   # Update package.json version
   npm version $DESIRED_VERSION --no-git-tag-version

   # Update Release Please manifest to match
   echo "{ \".\": \"$DESIRED_VERSION\" }" > .release-please-manifest.json
   ```

2. **Commit both files together:**
   ```bash
   git add package.json .release-please-manifest.json
   git commit -m "chore: align version to $DESIRED_VERSION for release"
   git push origin master
   ```

3. **Release Please will detect and create release PR:**
   - Release Please sees package.json and manifest are aligned
   - Creates release PR with your specified version
   - No additional version bump occurs

#### Option 3: Add workflow_dispatch to Release Please

**Enable manual triggering in workflow:**

1. **Modify `.github/workflows/release-please.yml`:**
   ```yaml
   name: Release Please

   on:
     push:
       branches:
         - master
     workflow_dispatch:  # Add this line
       inputs:
         version:
           description: 'Force specific version (optional)'
           required: false
           type: string
   ```

2. **Use manual trigger:**
   ```bash
   # Via GitHub CLI
   gh workflow run release-please.yml --ref master

   # Via GitHub Web Interface:
   # Go to Actions → Release Please → Run workflow → Run workflow
   ```

#### Option 4: Force Major Version Bump

**When Release Please calculates minor but you need major:**

1. **Add breaking change marker to recent commits:**
   ```bash
   # Amend recent commit to add breaking change
   git commit --amend -m "feat: new feature

   BREAKING CHANGE: this change breaks backward compatibility

   Previous commit message content here..."

   git push --force-with-lease origin master
   ```

2. **Or create new breaking change commit:**
   ```bash
   git commit --allow-empty -m "feat!: force major version bump

   BREAKING CHANGE: force major version increment for version alignment"
   git push origin master
   ```

#### Common Scenarios and Solutions

**Scenario 1: Release Please calculated 3.8.0, but you need 4.0.0**
```bash
# Force version in manifest
echo '{ ".": "4.0.0" }' > .release-please-manifest.json
git add .release-please-manifest.json
git commit -m "chore: force major version bump to 4.0.0"
git push origin master
```

**Scenario 2: Need to skip version 3.8.0 and go directly to 3.9.0**
```bash
# Set manifest to desired version
echo '{ ".": "3.9.0" }' > .release-please-manifest.json
npm version 3.9.0 --no-git-tag-version
git add package.json .release-please-manifest.json
git commit -m "chore: skip to version 3.9.0"
git push origin master
```

**Scenario 3: Emergency hotfix requiring specific version**
```bash
# From current master with urgent fix committed
HOTFIX_VERSION="3.7.1"
echo "{ \".\": \"$HOTFIX_VERSION\" }" > .release-please-manifest.json
npm version $HOTFIX_VERSION --no-git-tag-version
git add package.json .release-please-manifest.json
git commit -m "chore: emergency hotfix version $HOTFIX_VERSION"
git push origin master

# Force trigger Release Please immediately
git commit --allow-empty -m "chore: trigger immediate release for hotfix"
git push origin master
```

#### Important Notes

**⚠️ Version forcing considerations:**
- **Future releases:** Release Please will continue from your forced version
- **CHANGELOG:** Version jumps may create gaps in changelog
- **Semantic versioning:** Ensure forced versions follow semver rules
- **Team communication:** Document why specific version was forced

**🔧 Verification steps:**
1. Check Release Please creates PR with your exact version
2. Verify package.json version matches in release PR
3. Confirm CHANGELOG entries are correct
4. Test that future releases continue correctly from forced version

**💡 Best practices:**
- Force versions sparingly - only when necessary
- Document version forcing decisions in commit messages
- Verify Release Please behavior after forcing versions
- Update team about version alignment changes

### Step 1: Write Conventional Commits

All you need to do is write commits following the Conventional Commits format and merge them to master:

```bash
# Create feature branch
git checkout -b feat/add-new-tool

# Make changes
# ...

# Commit with conventional format
git commit -m "feat: add new tool for category exploration"

# Push and create PR
git push origin feat/add-new-tool
```

### Step 2: Merge to Master

Once your PR is approved and merged to master, **Release Please automatically**:

1. ✅ Analyzes all commits since last release
2. ✅ Determines version bump based on commit types
3. ✅ Generates/updates CHANGELOG.md
4. ✅ Creates or updates release PR

**You don't need to do anything!** Release Please handles it all.

### Step 3: Review Release PR

Release Please will create a PR like: **"chore(main): release 1.2.0"**

This PR contains:
- 📝 Updated `package.json` version
- 📝 Updated `CHANGELOG.md` with all changes
- 📝 Updated `.release-please-manifest.json`

**Review the release PR:**
1. Check version bump is correct (major/minor/patch)
2. Review CHANGELOG entries
3. Verify all important changes are documented

**Note:** The release PR is automatically updated when new commits are merged to master. You can keep merging features, and Release Please will update the version and CHANGELOG accordingly.

### Step 4: Merge Release PR

When you're ready to release, simply **merge the release PR**. This triggers automatic:

**GitHub Actions Workflow (`release-please.yml`):**
1. ✅ Runs all tests (unit, integration, type checking, linting)
2. ✅ Builds the package
3. ✅ Generates SBOM (Software Bill of Materials)
4. ✅ Creates SLSA Level 3 attestations
5. ✅ Publishes to npm with provenance
6. ✅ Creates Git tag (e.g., `v1.2.0`)
7. ✅ Updates GitHub release with artifacts
8. ✅ Uploads `dist.tar.gz` for Docker builds

**publish-docker.yml** (triggered by Release Please workflow after successful release merge):
1. ✅ Builds multi-arch Docker images (amd64, arm64)
2. ✅ Publishes to GitHub Container Registry (ghcr.io)
3. ✅ Tags with version and `latest`
4. ✅ Runs Trivy vulnerability scanning
5. ✅ Signs images with Cosign

### Step 5: Done!

That's it! Your release is live:
- 📦 npm package published: https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp
- 🐳 Docker images published: https://github.com/gander-tools/osm-tagging-schema-mcp/pkgs/container/osm-tagging-schema-mcp
- 🏷️ Git tag created: `vX.Y.Z`
- 📋 GitHub release created: https://github.com/gander-tools/osm-tagging-schema-mcp/releases

## Release Please Configuration

Configuration is in `release-please-config.json`:

```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "package-name": "@gander-tools/osm-tagging-schema-mcp",
      "changelog-sections": [
        // ... commit types mapping
      ]
    }
  }
}
```

**Key settings:**
- `release-type: "node"` - Node.js package (updates package.json)
- `changelog-sections` - Maps commit types to CHANGELOG sections

**Versioning Strategy:**
- Uses **strict semantic versioning** for versions >= 1.0.0
- **Only breaking changes** with `!` or `BREAKING CHANGE:` trigger major bumps
- All other commit types follow standard semver rules (feat → minor, fix → patch)

Current version is tracked in `.release-please-manifest.json`.

## Version Strategy

Release Please automatically determines version bumps following **strict semantic versioning**:

| Commits | Version Bump | Example |
|---------|--------------|---------|
| Only `fix:`, `docs:`, `refactor:` | **Patch** | 1.0.0 → 1.0.1 |
| At least one `feat:` | **Minor** | 1.0.0 → 1.1.0 |
| Any commit with `BREAKING CHANGE:` or `!` | **Major** | 1.0.0 → 2.0.0 |

**Current versioning behavior (>= 1.0.0):**
- `feat:` → bumps minor (1.0.0 → 1.1.0)
- `fix:`, `docs:`, `refactor:`, `perf:`, `revert:` → bumps patch (1.0.0 → 1.0.1)
- Breaking changes (with `!` or `BREAKING CHANGE:`) → bumps major (1.0.0 → 2.0.0)
- Hidden types (`chore:`, `ci:`, `test:`, `build:`, `style:`) → bumps patch but hidden from CHANGELOG

**IMPORTANT:** Only commits with explicit breaking change markers (`!` or `BREAKING CHANGE:`) will trigger major version bumps. No other commit type can trigger a major bump.

## Troubleshooting

### Release PR not created

**Cause:** No releasable commits since last release (only `chore:`, `ci:`, `test:`, etc.)

**Solution:**
1. Merge at least one `feat:`, `fix:`, or `docs:` commit to trigger release
2. **Force Release Please to specific version:** If you need immediate release:
   ```bash
   # Force Release Please to create release for desired version
   DESIRED_VERSION="3.7.1"  # Your target version

   # Update manifest to force version
   echo "{ \".\": \"$DESIRED_VERSION\" }" > .release-please-manifest.json
   git add .release-please-manifest.json
   git commit -m "chore: force release please to create release $DESIRED_VERSION"
   git push origin master

   # Verify Release Please creates PR for your version
   ```

### Wrong version bump

**Cause:** Release Please calculated incorrect version bump

**Solutions:**

**Option 1: Fix commit format and retrigger**
```bash
# If commits don't follow Conventional Commits format
# Amend recent commits to fix format
git commit --amend -m "feat: correct commit type for proper version bump"
git push --force-with-lease origin master
```

**Option 2: Force correct version in manifest**
```bash
# If Release Please calculated 3.8.0 but you need 4.0.0
CORRECT_VERSION="4.0.0"
echo "{ \".\": \"$CORRECT_VERSION\" }" > .release-please-manifest.json
git add .release-please-manifest.json
git commit -m "chore: correct version bump to $CORRECT_VERSION"
git push origin master
```

**Option 3: Add breaking change marker for major bump**
```bash
# If you need major but Release Please calculated minor/patch
git commit --allow-empty -m "feat!: force major version bump

BREAKING CHANGE: align version numbering requires major bump"
git push origin master
```

### CHANGELOG missing entries

**Cause:** Commits are hidden types (`test:`, `chore:`, `ci:`, etc.)

**Solution:** Use visible types for user-facing changes:
- Use `fix:` instead of `chore:` for bug fixes
- Use `feat:` instead of `chore:` for new features
- Use `docs:` for documentation changes

### Need to skip release

**Cause:** Release PR created but you want to include more changes

**Solution:** Just keep merging PRs to master. Release Please automatically updates the release PR with new commits and adjusts version/CHANGELOG.

### Publishing failed

**Check GitHub Actions logs:**
1. Go to **Actions** tab
2. Find the failed "Release Please" workflow
3. Review error logs in the `publish-npm` job
4. Common issues:
   - Tests failing
   - Build errors
   - npm authentication issues

**Retry options:**

**Option 1: Re-run failed workflow**
```bash
# Via GitHub CLI
gh run list --workflow=release-please.yml --limit 5
gh run rerun <failed-run-id>

# Via GitHub Web Interface:
# Go to Actions → find failed run → Re-run jobs
```

**Option 2: Fix issue and trigger new release**
```bash
# Fix the underlying issue in new commit
git add .
git commit -m "fix: resolve build/test issues for release"
git push origin master
# Release Please will automatically retry
```

**Option 3: Force Release Please to retry specific version**
```bash
# If you need to retry exact same version after fixing issues
RETRY_VERSION="3.7.0"  # Same version that failed
echo "{ \".\": \"$RETRY_VERSION\" }" > .release-please-manifest.json
git add .release-please-manifest.json
git commit -m "chore: retry release please for version $RETRY_VERSION after fixes"
git push origin master
```

### Need to undo a release

**If release PR not yet merged:**
- Just close the release PR
- Release Please will recreate it on next commit

**If release already published:**
- ⚠️ **Cannot unpublish npm packages** (npm policy)
- Must publish a new patch version with fixes
- Create PR with fixes, merge, and let Release Please create new release

### Want to release specific version

Release Please determines versions automatically. For manual control:

1. Use commit types strategically:
   - `fix:` for patch bumps
   - `feat:` for minor bumps
   - `feat!:` or `BREAKING CHANGE:` for major bumps

2. Or manually edit release PR before merging:
   - Edit `package.json` version
   - Edit `CHANGELOG.md` entries
   - Commit changes to release PR branch
   - Merge the updated release PR

## Comparison: Old vs New Process

### Old Process (release-it)
1. Run `npm run release` locally
2. Answer interactive prompts
3. Create release/vX.Y.Z branch manually
4. Push branch
5. Create PR manually
6. Merge PR
7. auto-release-from-pr.yml publishes

### New Process (Release Please)
1. Write conventional commits
2. Merge to master
3. **Done!** (Release Please handles everything)

**Time savings:** ~5 minutes per release → ~30 seconds

## Tools

- **Release Please**: Automated release management
  - Configuration: `release-please-config.json`
  - Manifest: `.release-please-manifest.json`
  - Documentation: https://github.com/googleapis/release-please
- **Conventional Commits**: Commit message standard
  - Documentation: https://www.conventionalcommits.org/
- **GitHub Actions**: CI/CD automation
  - `release-please.yml`: Automatic release PR, publishing, and Docker build trigger
  - `publish-docker.yml`: Docker image publishing (triggered by release-please.yml after successful release merge)
- **npm Trusted Publishers**: Secure publishing with OIDC authentication
- **SLSA Attestations**: Supply chain security

## Best Practices

1. **Write meaningful commit messages**: CHANGELOG is generated from commits
2. **Use correct commit types**: Determines version bump and CHANGELOG section
3. **Include descriptions**: Helps users understand changes
4. **One logical change per commit**: Makes CHANGELOG clearer
5. **Document breaking changes**: Always include `BREAKING CHANGE:` explanation
6. **Review release PRs**: Check version and CHANGELOG before merging
7. **Don't rush releases**: Let Release Please accumulate changes

## Related Documentation

- [contributing.md](./contributing.md) - Contribution guidelines (includes commit conventions)
- [CHANGELOG.md](../../CHANGELOG.md) - Version history
- [security.md](../deployment/security.md) - Security and provenance documentation
- [Release Please](https://github.com/googleapis/release-please) - Release automation tool
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message standard
