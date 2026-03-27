#!/usr/bin/env bash
# check-lockfile-version.sh
#
# Verifies that package-lock.json uses lockfileVersion 3.
# Exits with error if not, to prevent accidental commits of downgraded lockfiles.
#
# Used by: pre-commit hook (lockfile-check)

set -euo pipefail

LOCKFILE="package-lock.json"

if [ ! -f "$LOCKFILE" ]; then
  echo "⚠️  $LOCKFILE not found, skipping"
  exit 0
fi

if grep -q '"lockfileVersion": 3' "$LOCKFILE"; then
  echo "✅ Lockfile version 3 verified"
else
  echo "❌ Error: package-lock.json must use lockfileVersion 3"
  echo "Please regenerate with: npm install"
  exit 1
fi
