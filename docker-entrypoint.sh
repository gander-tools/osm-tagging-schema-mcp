#!/bin/sh
# Docker entrypoint for OSM Tagging Schema MCP Server
#
# Sends a Sentry startup event via sentry-cli ONLY when BOTH
# SENTRY_DSN (communication target) and SENTRY_DEBUG (diagnostic mode)
# are set simultaneously. In regular production (DSN set, DEBUG absent)
# no event is sent and sentry-cli is never invoked.
#
# GDPR/RODO: only non-personal metadata is attached (transport tag).
# sentry-cli reads SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE automatically.
set -e

if [ -n "${SENTRY_DSN}" ] && [ -n "${SENTRY_DEBUG}" ]; then
    # Run sentry-cli; its own output (confirmation or error details) goes to
    # stdout/stderr as-is so it is visible in container logs.
    # Using if/then/else keeps set -e happy without swallowing the exit code.
    if sentry-cli --log-level debug send-event \
            --message "OSM Tagging Schema MCP Server container started" \
            --level info \
            --tag "transport:${TRANSPORT:-stdio}"; then
        echo "[sentry] Startup event sent." >&2
    else
        echo "[sentry] Failed to send startup event (non-fatal, continuing)." >&2
    fi
fi

exec "$@"
