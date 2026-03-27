#!/usr/bin/env bash
# fix-lockfile-libc.sh
#
# Removes "libc" constraints from platform-specific packages in package-lock.json.
#
# Problem: npm 11.6.4 (used in CI) strips "libc" fields from optional
# platform-specific packages (e.g. @biomejs/cli-linux-*) when running
# `npm ci`, causing a lockfile mismatch error and failing CI.
#
# Fix: Remove all "libc" entries before committing so the lockfile
# is already in the state npm 11.6.4 would produce.
#
# Used by: lefthook pre-commit hook (lockfile-libc-fix command)

set -euo pipefail

LOCKFILE="package-lock.json"

if [ ! -f "$LOCKFILE" ]; then
  echo "⚠️  $LOCKFILE not found, skipping"
  exit 0
fi

node - "$LOCKFILE" <<'EOF'
const fs = require("node:fs");
const path = require("node:path");

const lockfilePath = process.argv[2];
const raw = fs.readFileSync(lockfilePath, "utf8");
const lock = JSON.parse(raw);

let removedCount = 0;

for (const pkg of Object.values(lock.packages ?? {})) {
  if (Object.prototype.hasOwnProperty.call(pkg, "libc")) {
    delete pkg.libc;
    removedCount++;
  }
}

if (removedCount > 0) {
  fs.writeFileSync(lockfilePath, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`✅ Removed "libc" constraints from ${removedCount} package(s) in ${path.basename(lockfilePath)}`);
} else {
  console.log(`✅ No "libc" constraints found in ${path.basename(lockfilePath)}`);
}
EOF
