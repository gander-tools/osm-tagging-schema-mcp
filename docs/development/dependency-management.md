# Dependency Management

This document covers dependency update automation for the OSM Tagging Schema MCP Server project.

## Table of Contents

- [Overview](#overview)
- [Current Setup: Renovate](#current-setup-renovate)
- [Disabling Dependabot](#disabling-dependabot)
- [Installing Renovate](#installing-renovate)
- [Why Renovate Over Dependabot](#why-renovate-over-dependabot)
- [Configuration Details](#configuration-details)

## Overview

This project uses **Renovate** for automated dependency updates. Renovate is configured to:

- Monitor dependencies for updates
- Create pull requests automatically
- Follow the project's version pinning policy (tilde `~` for production, caret `^` for dev)
- Automerge minor and patch updates (with CI passing)
- Group related updates together

## Current Setup: Renovate

The project is already configured with Renovate via the `renovate.json` file.

**Status**: ✅ **Active and configured**

Renovate automatically:
- Scans `package.json` for dependency updates
- Creates PRs for outdated dependencies
- Respects semantic versioning rules
- Automerges safe updates (with tests passing)

## Disabling Dependabot

If you have Dependabot enabled in your fork or similar project, you should disable it to avoid conflicts with Renovate.

### Option 1: Delete Dependabot Configuration File

If Dependabot is configured via a file:

```bash
# Remove Dependabot configuration
rm -f .github/dependabot.yml
git add .github/dependabot.yml
git commit -m "chore: remove Dependabot configuration"
git push
```

### Option 2: Disable via GitHub Settings

If Dependabot is enabled at the repository level:

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click **Settings** (top navigation)

2. **Access Security Settings**
   - In the left sidebar, click **Code security and analysis**

3. **Disable Dependabot Alerts**
   - Find **Dependabot alerts**
   - Click **Disable**

4. **Disable Dependabot Security Updates**
   - Find **Dependabot security updates**
   - Click **Disable**

5. **Disable Dependabot Version Updates**
   - Find **Dependabot version updates**
   - Click **Disable**

### Option 3: Pause Dependabot via Configuration

If you want to temporarily pause Dependabot without removing the configuration:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 0  # Set to 0 to pause
```

### Verify Dependabot is Disabled

After disabling, verify that:

1. No new Dependabot PRs are created
2. Existing Dependabot PRs can be closed
3. The Insights → Dependency graph page shows "Dependabot: Off"

## Installing Renovate

If you're setting up Renovate for a new project or fork:

### Prerequisites

- GitHub repository with npm dependencies
- Admin access to the repository
- Node.js project with `package.json`

### Installation Steps

#### Step 1: Install the Renovate GitHub App

1. **Navigate to Renovate App**
   - Go to: https://github.com/apps/renovate
   - Click **Install**

2. **Select Repositories**
   - Choose **Only select repositories**
   - Select your repository (e.g., `gander-tools/osm-tagging-schema-mcp`)
   - Click **Install**

3. **Authorize Renovate**
   - Review permissions
   - Click **Authorize**

**Permissions Required:**
- Read access to code, issues, and metadata
- Write access to pull requests, commit statuses, and checks

#### Step 2: Create Renovate Configuration File

Create a `renovate.json` file in your repository root:

```bash
# Create basic Renovate configuration
cat > renovate.json <<'EOF'
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended"
  ],
  "npm": {
    "rangeStrategy": "pin"
  },
  "automerge": true,
  "automergeType": "pr",
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
EOF

# Commit and push
git add renovate.json
git commit -m "chore: add Renovate configuration"
git push
```

#### Step 3: Wait for Onboarding PR

After installing Renovate, it will automatically:

1. Scan your repository
2. Create an **Onboarding PR** titled "Configure Renovate"
3. Show a preview of what updates will be created

**Review the Onboarding PR:**
- Check the detected dependencies
- Review proposed updates
- Verify configuration is correct

**Merge the Onboarding PR:**
```bash
# Via GitHub UI or CLI
gh pr merge <PR-NUMBER> --merge
```

#### Step 4: Verify Installation

After merging the onboarding PR:

```bash
# Check for Renovate PRs
gh pr list --label "renovate"

# Verify Renovate bot is active
gh api repos/:owner/:repo/installation
```

Expected behavior:
- ✅ Renovate PRs appear for outdated dependencies
- ✅ PRs follow your configuration (automerge, grouping, etc.)
- ✅ CI checks run on Renovate PRs
- ✅ Safe updates automerge automatically

### Advanced Configuration

For this project's specific setup:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>gander-settings/renovate:automerge"],
  "packageRules": [
    {
      "matchDepTypes": ["dependencies"],
      "rangeStrategy": "pin",
      "semanticCommitType": "chore",
      "semanticCommitScope": "deps"
    },
    {
      "matchDepTypes": ["devDependencies"],
      "rangeStrategy": "bump",
      "semanticCommitType": "chore",
      "semanticCommitScope": "deps-dev"
    }
  ],
  "lockFileMaintenance": {
    "enabled": true,
    "automerge": true
  }
}
```

**Key Settings:**
- `rangeStrategy: "pin"` - Maintains tilde (`~`) ranges for production deps
- `rangeStrategy: "bump"` - Maintains caret (`^`) ranges for dev deps
- `automerge: true` - Automerges safe updates with CI passing
- `lockFileMaintenance` - Keeps `package-lock.json` up to date

## Why Renovate Over Dependabot

This project uses Renovate instead of Dependabot for several reasons:

### Advantages of Renovate

| Feature | Renovate | Dependabot |
|---------|----------|------------|
| **Configuration Flexibility** | ✅ Extensive JSON config | ⚠️ Limited YAML config |
| **Automerge** | ✅ Built-in with rules | ⚠️ Manual or GitHub Actions |
| **Grouping Updates** | ✅ Powerful grouping rules | ⚠️ Basic grouping |
| **Range Strategy** | ✅ Multiple strategies | ⚠️ Limited control |
| **Schedule Control** | ✅ Flexible scheduling | ⚠️ Limited schedules |
| **Monorepo Support** | ✅ Excellent | ⚠️ Limited |
| **Custom Managers** | ✅ Regex and custom | ❌ Not supported |
| **Shared Configs** | ✅ Extend presets | ⚠️ Limited sharing |

### Specific Benefits for This Project

1. **Version Range Control**
   - Renovate respects tilde (`~`) ranges for production dependencies
   - Preserves caret (`^`) ranges for dev dependencies
   - Dependabot often changes ranges unexpectedly

2. **Automerge Safety**
   - Renovate automerges only after CI passes
   - Configurable automerge rules by update type
   - Reduces manual PR review burden

3. **Conventional Commits**
   - Renovate creates commits following Conventional Commits
   - Integrates with Release Please workflow
   - Proper semantic versioning based on dependency updates

4. **GitHub Actions Compatibility**
   - Renovate works well with pinned SHA actions
   - Can update action versions automatically
   - Dependabot struggles with SHA-pinned actions

5. **SBOM and Security**
   - Renovate updates integrate with SBOM generation
   - Security updates prioritized automatically
   - Better vulnerability tracking

### When to Use Dependabot

Dependabot might be preferred if:

- ❌ Simple dependency management needs
- ❌ Only basic update notifications required
- ❌ No automerge requirements
- ❌ GitHub-native solution preferred over third-party app

For this project's complexity and requirements, **Renovate is the better choice**.

## Configuration Details

### Current Renovate Configuration

The project extends a shared Renovate configuration with custom settings:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>gander-settings/renovate:automerge"],
  "prCreation": "immediate",
  "rebaseWhen": "never",
  "minimumReleaseAge": "3 days"
}
```

**Shared Configuration** (`github>gander-settings/renovate:automerge`):
- Automerges minor and patch updates
- Groups dependency updates logically
- Follows semantic versioning rules
- Respects package.json version ranges
- Creates conventional commit messages

**Additional protections from `config:recommended` preset**:
- Automatically detects and flags vulnerable dependencies
- Prioritizes security updates over normal dependencies
- Closes PRs for unpublished versions
- Respects npm deprecation warnings

#### Best Practices

1. **Monitor Renovate activity**: Check PRs regularly for security/deprecated labels
2. **Review closed PRs**: If Renovate closes a PR, check why (unpublished version = red flag)
3. **Trust the safety net**: With these protections, you won't accidentally merge withdrawn/vulnerable packages
4. **Security PRs**: May automerge faster than 3 days (check preset for exceptions)

#### Edge Cases

**Q: What if a package is deprecated AFTER automerge but BEFORE 3 days?**

A: Renovate checks deprecation status before automerge. Timeline:
```
Day 0: 1.0.0 released → PR created
Day 1: 1.0.0 deprecated → Renovate adds label, blocks automerge
Day 3: minimumReleaseAge passed → automerge STILL BLOCKED ✅
```

**Q: Can I manually merge a deprecated/vulnerable version?**

A: Yes, but not recommended. The PR will have clear warnings/labels. Consider:
1. Why was it deprecated? (bug, security, better alternative?)
2. Is the fix version available? (check for newer PR)
3. Is manual intervention really needed? (usually not)

### Viewing Renovate Activity

**Check Renovate Dashboard:**
```bash
# View Renovate PRs
gh pr list --label "renovate"

# View Renovate issues
gh issue list --label "renovate"
```

**Renovate Bot Commands:**

You can control Renovate via PR comments:

- `@renovatebot rebase` - Rebase PR on latest master
- `@renovatebot recreate` - Recreate PR from scratch
- `@renovatebot retry` - Retry failed updates
- `@renovatebot stop` - Stop Renovate on this PR

### Troubleshooting

**Renovate PRs Not Appearing:**

1. Check Renovate is installed:
   ```bash
   gh api /repos/:owner/:repo/installation
   ```

2. Verify configuration is valid:
   ```bash
   # Validate renovate.json
   npx --yes renovate-config-validator
   ```

3. Check Renovate logs:
   - Go to: https://app.renovatebot.com/dashboard
   - Find your repository
   - View activity logs

**Automerge Not Working:**

1. Ensure CI checks are passing
2. Verify branch protection rules allow automerge
3. Check that automerge is enabled in repository settings
4. Review Renovate configuration for automerge rules

**Version Range Changes:**

If Renovate is changing version ranges incorrectly:

1. Verify `rangeStrategy` in configuration
2. Use `rangeStrategy: "pin"` for tilde ranges
3. Use `rangeStrategy: "bump"` for caret ranges
4. Test configuration with `renovate-config-validator`

## Related Documentation

- **[Contributing Guidelines](contributing.md)** - Dependency version pinning policy
- **[Release Process](release-process.md)** - How releases work with dependency updates
- **[Security](../deployment/security.md)** - SBOM and dependency security

## External Resources

- **Renovate Documentation**: https://docs.renovatebot.com/
- **Renovate GitHub App**: https://github.com/apps/renovate
- **Renovate Configuration Options**: https://docs.renovatebot.com/configuration-options/
- **Dependabot Documentation**: https://docs.github.com/en/code-security/dependabot
- **Comparing Tools**: https://docs.renovatebot.com/migrate-dependabot/

## Questions?

If you have questions about dependency management:

1. Check this documentation first
2. Review [Renovate docs](https://docs.renovatebot.com/)
3. Open a GitHub issue with the `dependencies` label
4. Contact project maintainers
