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

### Manual Release Creation

While the project uses Release Please for automated releases, there are scenarios where you might need to create releases manually:

#### When to Create Manual Releases

**Emergency releases:**
- Critical security patches that can't wait for Release Please workflow
- Hotfixes that need immediate deployment
- Production outages requiring urgent releases

**Development/testing scenarios:**
- Pre-release versions (alpha, beta, rc)
- Fork/development testing
- Custom release configurations not supported by Release Please

**Release Please bypass:**
- Workflow failures that can't be resolved quickly
- Major version releases requiring manual control
- Custom release notes or assets

#### Option 1: Manual Release via GitHub CLI

**Prerequisites:**
```bash
# Install and authenticate GitHub CLI
gh auth login

# Ensure you're on the correct commit/tag
git checkout master
git pull origin master
```

**Create manual release:**

1. **Determine next version:**
   ```bash
   # Get current version from package.json
   CURRENT_VERSION=$(node -p "require('./package.json').version")
   echo "Current version: $CURRENT_VERSION"

   # Choose next version (manual decision)
   # For patch: 1.0.0 → 1.0.1
   # For minor: 1.0.0 → 1.1.0
   # For major: 1.0.0 → 2.0.0
   NEW_VERSION="1.0.1"  # Replace with desired version
   ```

2. **Update version and build:**
   ```bash
   # Update package.json version
   npm version $NEW_VERSION --no-git-tag-version

   # Generate version.json
   BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   cat > src/version.json <<EOF
   {
     "version": "$NEW_VERSION",
     "buildTimestamp": "$BUILD_TIMESTAMP"
   }
   EOF

   # Build the package
   npm run build
   cp src/version.json dist/version.json

   # Run tests to ensure everything works
   npm test
   ```

3. **Create Git tag and release:**
   ```bash
   # Commit version changes
   git add package.json src/version.json
   git commit -m "chore: release $NEW_VERSION"

   # Create and push tag
   git tag "v$NEW_VERSION"
   git push origin master
   git push origin "v$NEW_VERSION"

   # Create GitHub release
   gh release create "v$NEW_VERSION" \
     --title "Release $NEW_VERSION" \
     --notes "Manual release $NEW_VERSION

   ## Changes
   - [Add your release notes here]

   ## 📦 Installation
   \`\`\`bash
   npx @gander-tools/osm-tagging-schema-mcp@$NEW_VERSION
   \`\`\`

   🤖 Generated with [Claude Code](https://claude.com/claude-code)" \
     --latest
   ```

4. **Publish to npm (optional):**
   ```bash
   # Create package tarball
   npm pack

   # Publish to npm (requires authentication)
   npm publish --access public
   ```

#### Option 2: Manual Release via GitHub Web Interface

1. **Prepare release locally:**
   ```bash
   # Update version and build (same as CLI method)
   NEW_VERSION="1.0.1"
   npm version $NEW_VERSION --no-git-tag-version

   # Generate version.json and build
   BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   cat > src/version.json <<EOF
   {
     "version": "$NEW_VERSION",
     "buildTimestamp": "$BUILD_TIMESTAMP"
   }
   EOF

   npm run build
   cp src/version.json dist/version.json
   npm test

   # Commit and push
   git add package.json src/version.json
   git commit -m "chore: release $NEW_VERSION"
   git push origin master
   ```

2. **Create release via GitHub UI:**
   - Go to repository on GitHub.com
   - Click **"Releases"** tab
   - Click **"Create a new release"**
   - **Tag:** Enter `v1.0.1` (or your version)
   - **Title:** `Release 1.0.1`
   - **Description:** Add release notes
   - **Assets:** Optionally upload additional files
   - Click **"Publish release"**

#### Option 3: Emergency Hotfix Release

For urgent production fixes:

1. **Create hotfix branch:**
   ```bash
   # From latest release tag
   git checkout v3.7.0  # Latest stable tag
   git checkout -b hotfix/critical-security-patch

   # Make minimal fix
   # ... edit files ...

   # Test the fix
   npm test
   ```

2. **Create patch release:**
   ```bash
   # Bump patch version
   npm version patch --no-git-tag-version
   NEW_VERSION=$(node -p "require('./package.json').version")

   # Build and commit
   npm run build
   git add .
   git commit -m "fix: critical security patch

   SECURITY-FIX: Address CVE-XXXX-XXXX vulnerability

   This is a critical security patch that should be deployed immediately."

   # Tag and push
   git tag "v$NEW_VERSION"
   git push origin hotfix/critical-security-patch
   git push origin "v$NEW_VERSION"

   # Create emergency release
   gh release create "v$NEW_VERSION" \
     --title "Security Patch $NEW_VERSION" \
     --notes "🚨 **CRITICAL SECURITY PATCH** 🚨

   This release addresses a critical security vulnerability.
   **Immediate update recommended.**

   ## Security Fix
   - Address CVE-XXXX-XXXX vulnerability

   ## Installation
   \`\`\`bash
   npx @gander-tools/osm-tagging-schema-mcp@$NEW_VERSION
   \`\`\`" \
     --latest

   # Publish to npm immediately
   npm publish --access public
   ```

#### Pre-release Versions

For testing versions before stable release:

```bash
# Create pre-release version
NEW_VERSION="1.1.0-beta.1"
npm version $NEW_VERSION --no-git-tag-version

# Build and tag
npm run build
git add package.json src/version.json
git commit -m "chore: pre-release $NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin master
git push origin "v$NEW_VERSION"

# Create pre-release on GitHub
gh release create "v$NEW_VERSION" \
  --title "Pre-release $NEW_VERSION" \
  --notes "Beta release for testing" \
  --prerelease

# Publish as pre-release to npm
npm publish --access public --tag beta
```

#### Important Considerations

**⚠️ Manual release limitations:**
- **Bypasses Release Please:** Manual releases won't update `.release-please-manifest.json`
- **CHANGELOG:** Must manually update `CHANGELOG.md`
- **Version conflicts:** May conflict with future Release Please versions
- **CI/CD:** Manual releases may skip automated tests/checks

**🔧 Post-manual release cleanup:**
- Update `.release-please-manifest.json` with manual version
- Update `CHANGELOG.md` with release notes
- Ensure Release Please configuration accounts for manual releases

**💡 Best practices:**
- Use manual releases sparingly - only for emergencies or special cases
- Always run full test suite before manual release
- Document why manual release was necessary
- Follow semantic versioning strictly
- Update all relevant documentation and changelogs

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
2. **Manual release option:** If you need immediate release regardless:
   ```bash
   # Verify current version
   CURRENT_VERSION=$(node -p "require('./package.json').version")
   echo "Current version: $CURRENT_VERSION"

   # Create manual release (see Manual Release Creation section above)
   NEW_VERSION="1.0.1"  # Choose appropriate version
   npm version $NEW_VERSION --no-git-tag-version

   # Follow manual release process
   # See "Manual Release Creation" section for complete steps
   ```

### Wrong version bump

**Cause:** Commits don't follow Conventional Commits format

**Solution:**
1. Ensure commits use correct prefixes (`feat:`, `fix:`, etc.)
2. For breaking changes, include `BREAKING CHANGE:` in footer or use `!`
3. Release Please only sees commits merged to master

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

**For automated Release Please failures:**

**Check GitHub Actions logs:**
1. Go to **Actions** tab
2. Find the failed "Release Please" workflow
3. Review error logs in the `publish-npm` job
4. Common issues:
   - Tests failing
   - Build errors
   - npm authentication issues

**Fix:**
1. Fix the issue in a new PR and merge to master
2. Release Please will automatically retry on next push

**For manual release failures:**

**Common manual release issues:**
- npm authentication failures
- Git tag conflicts
- Build/test failures
- Network issues during upload

**Manual release recovery:**
```bash
# If tag creation failed
git tag -d v1.0.1  # Delete local tag
git push origin :refs/tags/v1.0.1  # Delete remote tag
# Then retry manual release process

# If npm publish failed
npm unpublish @gander-tools/osm-tagging-schema-mcp@1.0.1  # If just published
# Fix issues, then retry: npm publish --access public

# If GitHub release creation failed
gh release delete v1.0.1  # Delete failed release
# Then retry: gh release create v1.0.1 --title "..." --notes "..."

# Complete recovery and retry
git reset --hard HEAD~1  # Undo version commit
# Fix issues, then follow manual release process again
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
