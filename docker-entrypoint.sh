#!/bin/sh
# Docker entrypoint for OSM Tagging Schema MCP Server
#
# Sends a Sentry startup event via sentry-cli ONLY when BOTH
# SENTRY_DSN (communication target) and SENTRY_DEBUG (diagnostic mode)
# are set simultaneously. In regular production (DSN set, DEBUG absent)
# no event is sent and sentry-cli is never invoked.
# sentry-cli prints its own output ("Event dispatched. / Event id: ...") directly.
#
# GDPR/RODO: only non-personal metadata is attached (transport tag).
# sentry-cli reads SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE automatically.
set -e

if [ -n "${SENTRY_DSN}" ] && [ -n "${SENTRY_DEBUG}" ]; then
    sentry-cli send-event \
        --message "OSM Tagging Schema MCP Server container started" \
        --level info \
        --tag "transport:${TRANSPORT:-stdio}" || true
fi

exec "$@"
