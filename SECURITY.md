# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, please report security issues using one of these methods:

### GitHub Security Advisories (Preferred)

1. Navigate to the repository's Security tab
2. Click "Report a vulnerability"
3. URL: https://github.com/gander-tools/osm-tagging-schema-mcp/security/advisories/new

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Varies by severity (coordinated with reporter)

## Security Updates

When security issues are discovered:

1. **Private fix**: Developed privately in coordination with reporter
2. **Coordinated disclosure**: We work with reporters on disclosure timing
3. **Security advisory**: Published when fixed version is released
4. **Version release**: New version published with fix
5. **User notification**: Security advisories sent via GitHub

## Known Vulnerabilities

### Current Status: ✅ NOT VULNERABLE

> **⚠️ TEMPORARY NOTE**: Delete this section when MCP SDK CVE is patched and project upgrades to safe version.

#### MCP TypeScript SDK - UriTemplate ReDoS (Issue #965)

**Status**: Project is **NOT AFFECTED** by this vulnerability

**Details**:
- **Vulnerability**: ReDoS in MCP SDK's UriTemplate class
- **Affected**: MCP servers using resource handlers with exploded URI templates (`{/path*}`)
- **This project**: Does NOT use resource handlers - only Tools and Prompts
- **Conclusion**: Safe to use

**References**:
- Issue: https://github.com/modelcontextprotocol/typescript-sdk/issues/965
- Detailed analysis: See [docs/deployment/security.md](docs/deployment/security.md#known-vulnerabilities--mitigation)

**Future considerations**: If implementing MCP resources, avoid exploded array patterns until SDK is patched.

## Security Features

This project implements comprehensive security measures:

- ✅ **NPM Provenance**: Cryptographic build attestations (SLSA Level 3)
- ✅ **SBOM**: Software Bill of Materials for transparency
- ✅ **Image Signing**: Docker images signed with Cosign
- ✅ **Vulnerability Scanning**: Automated Trivy scanning
- ✅ **Dependency Management**: Automated security updates via Renovate

For detailed information, see [Security & Supply Chain Documentation](docs/deployment/security.md).

## Security Best Practices

### For Users

1. **Verify provenance** before installing from npm
2. **Pin versions** in production: `@gander-tools/osm-tagging-schema-mcp@3.7.0`
3. **Run `npm audit`** regularly
4. **Review SBOM** for unexpected dependencies
5. **Verify Docker signatures** before deployment

### For Contributors

1. **Enable 2FA** on GitHub account
2. **Sign commits** with GPG
3. **Review dependencies** carefully
4. **Run security scans** before submitting PRs
5. **Request minimal permissions**

## Additional Resources

- [Security & Supply Chain Documentation](docs/deployment/security.md)
- [NPM Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore Cosign](https://docs.sigstore.dev/)

## Questions?

For security questions (non-vulnerability):
- GitHub Discussions: https://github.com/gander-tools/osm-tagging-schema-mcp/discussions

For vulnerability reports:
- GitHub Security Advisories: https://github.com/gander-tools/osm-tagging-schema-mcp/security/advisories/new
