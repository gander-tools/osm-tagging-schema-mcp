# Security & Supply Chain

This document explains the security measures and supply chain integrity mechanisms implemented for the `@gander-tools/osm-tagging-schema-mcp` package.

## Overview

The package is published with comprehensive supply chain security features:

- **NPM Provenance**: Cryptographic attestations linking packages to builds
- **SLSA Build Provenance**: Verifiable build metadata (SLSA Level 3)
- **SBOM (Software Bill of Materials)**: Complete dependency transparency
- **Image Signing**: Docker images signed with Cosign
- **Vulnerability Scanning**: Automated scanning with Trivy

## NPM Provenance

### What is NPM Provenance?

NPM provenance provides cryptographic proof that a package was built by a specific GitHub Actions workflow from verifiable source code. This prevents supply chain attacks by ensuring packages cannot be tampered with or replaced.

### How It Works

When a package is published with provenance:

1. GitHub Actions generates a cryptographic attestation
2. The attestation links the package to:
   - Source repository and commit
   - Build workflow and runner
   - Timestamp and build environment
3. NPM stores the attestation and displays it on the package page
4. Users can verify the attestation to ensure package authenticity

### Verifying NPM Provenance

**View provenance on NPM:**
```bash
# Visit the package page
https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp
```

Look for the "Provenance" section showing:
- ✅ Built and signed on GitHub Actions
- Repository and commit information
- Build workflow details

**Verify with npm CLI:**
```bash
npm audit signatures
```

This command verifies:
- Package signatures are valid
- Packages were built from declared sources
- No tampering occurred after build

**Verify specific version:**
```bash
npm view @gander-tools/osm-tagging-schema-mcp@0.1.0 dist.attestations
```

## SLSA Build Provenance

### What is SLSA?

[SLSA (Supply chain Levels for Software Artifacts)](https://slsa.dev/) is a framework for ensuring software supply chain integrity. This package achieves **SLSA Level 3** through:

- Provenance generation during build
- Non-falsifiable provenance (signed by GitHub)
- Isolated build environment
- Parameterless builds from source

### SLSA Attestations

Build provenance attestations are generated for:
- **NPM package tarball**: The `.tgz` file published to npm
- **SBOM**: The Software Bill of Materials

Attestations include:
- Build inputs (source commit, dependencies)
- Build process (workflow, runner, commands)
- Build outputs (artifacts and checksums)
- Builder identity (GitHub Actions)

### Verifying SLSA Attestations

**Using GitHub CLI:**
```bash
# Install GitHub CLI
gh auth login

# Verify attestations for npm package
gh attestation verify \
  oci://registry.npmjs.org/@gander-tools/osm-tagging-schema-mcp:0.1.0 \
  --owner gander-tools
```

**Using slsa-verifier:**
```bash
# Install slsa-verifier
go install github.com/slsa-framework/slsa-verifier/v2/cli/slsa-verifier@latest

# Download package tarball
npm pack @gander-tools/osm-tagging-schema-mcp

# Verify provenance
slsa-verifier verify-artifact \
  gander-tools-osm-tagging-schema-mcp-0.1.0.tgz \
  --provenance-path <path-to-provenance> \
  --source-uri github.com/gander-tools/osm-tagging-schema-mcp
```

## SBOM (Software Bill of Materials)

### What is SBOM?

An SBOM is a complete inventory of all components and dependencies in a software package. It enables:

- **Transparency**: Know exactly what's in the package
- **Vulnerability Management**: Identify affected versions quickly
- **License Compliance**: Track open source license obligations
- **Supply Chain Risk**: Assess third-party dependency risks

### SBOM Format

We generate SBOMs in [CycloneDX](https://cyclonedx.org/) format, an industry standard for software supply chain transparency.

The SBOM includes:
- Direct dependencies with versions
- Transitive dependencies
- Package licenses
- Component hashes and checksums

### Accessing the SBOM

**Download from GitHub release:**
```bash
# SBOM is attached to each GitHub release
gh release download v0.1.0 --pattern 'sbom.json'
```

**Generate locally:**
```bash
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-file sbom.json
```

**Verify SBOM attestation:**
```bash
gh attestation verify sbom.json --owner gander-tools
```

## Docker Image Security

Docker images published to GitHub Container Registry include additional security measures:

### Image Signing with Cosign

All images are signed using [Sigstore Cosign](https://docs.sigstore.dev/cosign/overview/) with keyless signing:

**Verify image signature:**
```bash
# Install cosign
brew install cosign  # macOS
# or
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# Verify signature
cosign verify ghcr.io/gander-tools/osm-tagging-schema-mcp:latest \
  --certificate-identity-regexp=https://github.com/gander-tools \
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com
```

### Shared Build Artifact Provenance

Docker images built for release versions (tags) use the **exact same compiled code** as the NPM package, ensuring complete consistency and traceability:

**Provenance Chain:**
```
Source Code (GitHub)
  ↓ (GitHub Actions build)
dist/ artifact (TypeScript compiled to JavaScript)
  ↓ (uploaded as artifact)
NPM package (SLSA Level 3 attestations)
  ↓ (attached to GitHub Release as dist.tar.gz)
Docker image (uses dist.tar.gz from release)
```

**Benefits:**
- **Build Consistency**: Docker image contains identical code to NPM package
- **Single Build**: TypeScript compiled once, used by both NPM and Docker
- **SLSA Provenance**: Docker image inherits SLSA Level 3 attestations from NPM build
- **Verifiable**: Complete audit trail from source to both distribution formats

**Verification:**

1. **Download dist.tar.gz from GitHub Release:**
   ```bash
   # Download artifact from release
   gh release download v1.0.0 --pattern 'dist.tar.gz'

   # Extract and inspect
   tar xzf dist.tar.gz
   ls -la dist/
   ```

2. **Compare with NPM package:**
   ```bash
   # Download NPM package
   npm pack @gander-tools/osm-tagging-schema-mcp@1.0.0
   tar xzf gander-tools-osm-tagging-schema-mcp-1.0.0.tgz

   # Compare dist/ contents
   diff -r package/dist/ dist/
   ```

3. **Verify Docker image uses same artifact:**
   ```bash
   # Extract dist/ from Docker image
   docker create --name temp ghcr.io/gander-tools/osm-tagging-schema-mcp:1.0.0
   docker cp temp:/app/dist ./docker-dist
   docker rm temp

   # Compare with release artifact
   diff -r docker-dist/ dist/
   ```

**Implementation Details:**
- Unified multi-stage `Dockerfile` with two build targets
- Release builds use `--target release` (artifact-based)
- Development builds use default target (multi-stage with TypeScript compilation)
- Artifact attached to every GitHub Release as `dist.tar.gz`

### Vulnerability Scanning

Images are automatically scanned with [Trivy](https://trivy.dev/) for:
- OS package vulnerabilities
- Node.js dependencies vulnerabilities
- Configuration issues
- Exposed secrets

**Scan results:**
- Available in GitHub Security tab
- CRITICAL and HIGH severity issues block releases
- SARIF reports uploaded for each build

**Manual scan:**
```bash
# Install trivy
brew install trivy

# Scan image
trivy image ghcr.io/gander-tools/osm-tagging-schema-mcp:latest
```

## Security Best Practices

### For Users

1. **Verify Provenance**: Always check npm provenance before installing
2. **Pin Versions**: Use exact versions in production (`@gander-tools/osm-tagging-schema-mcp@0.1.0`)
3. **Audit Dependencies**: Run `npm audit` regularly
4. **Review SBOM**: Check the SBOM for unexpected dependencies
5. **Verify Signatures**: Verify Docker image signatures before deployment

### For Contributors

1. **Enable 2FA**: GitHub account must have 2FA enabled
2. **Sign Commits**: Use GPG signing for commits
3. **Review Dependencies**: Carefully review dependency updates
4. **Security Scanning**: Run security scans before submitting PRs
5. **Least Privilege**: Request minimal permissions needed

## Incident Response

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, please report security issues using:
- **GitHub Security Advisories**: Navigate to the repository's "Security" tab and click "Report a vulnerability"
  - URL: https://github.com/gander-tools/osm-tagging-schema-mcp/security/advisories/new
- **Private Disclosure**: This ensures coordinated vulnerability disclosure

We will respond within 48 hours and coordinate responsible disclosure.

### Security Updates

When security issues are discovered:

1. **Private fix**: Security fixes are developed privately
2. **Coordinated disclosure**: We work with reporters on disclosure timing
3. **Security advisory**: Published when fixed version is released
4. **Version release**: New version published with fix
5. **User notification**: Security advisories sent to users

## Compliance & Certifications

### SLSA Level 3

This package meets SLSA Level 3 requirements:

- ✅ Provenance generated and signed
- ✅ Non-falsifiable (signed by GitHub Actions)
- ✅ Isolated build (GitHub-hosted runners)
- ✅ Parameterless builds from source
- ✅ Available provenance (published with package)

### OpenSSF Best Practices

Following [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/):

- ✅ Vulnerability disclosure process
- ✅ Automated security testing
- ✅ Dependency management with Renovate
- ✅ SBOM generation
- ✅ Signed releases

## Additional Resources

- [NPM Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)
- [SLSA Framework](https://slsa.dev/)
- [CycloneDX SBOM Specification](https://cyclonedx.org/)
- [Sigstore Cosign Documentation](https://docs.sigstore.dev/)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

## Questions?

For security questions or to report issues, please contact us through:
- **GitHub Security Advisories** (for vulnerability reports): https://github.com/gander-tools/osm-tagging-schema-mcp/security/advisories/new
- **GitHub Discussions** (for general security questions): https://github.com/gander-tools/osm-tagging-schema-mcp/discussions
