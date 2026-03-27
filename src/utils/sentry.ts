/**
 * Sentry error monitoring integration (opt-in, GDPR/RODO compliant)
 *
 * Enabled only when the SENTRY_DSN environment variable is set.
 * When not set, every exported function is a safe no-op.
 *
 * GDPR/RODO compliance measures:
 * - sendDefaultPii: false   — no IP addresses, user-agents, or cookies
 * - tracesSampleRate: 0     — no performance tracing (avoids capturing request data)
 * - Http / NodeFetch / RequestData / LocalVariablesAsync / Console integrations disabled
 *   to prevent automatic capture of HTTP request bodies or local variable values
 * - beforeSend hook strips event.request and event.user as defence-in-depth
 * - Tool call arguments (user-provided OSM tag data) are NEVER sent; only the tool name is captured
 */

import * as Sentry from "@sentry/node";
import { getVersionInfo } from "../version.js";

/**
 * Names of default Sentry integrations that may capture user/request data.
 * Filtered out to comply with GDPR/RODO.
 */
const DISABLED_INTEGRATIONS = [
	"Http", // auto-instruments node:http — breadcrumbs for every HTTP request
	"NodeFetch", // auto-instruments global fetch — same risk as Http
	"RequestData", // attaches HTTP request body/headers to events
	"LocalVariablesAsync", // captures local variable values at exception site (may include tool args)
	"Console", // breadcrumbs from console.* calls (may include user data in log messages)
] as const;

/**
 * Initialise Sentry. Call once, before any async operations, as the very
 * first thing in main(). Safe no-op when SENTRY_DSN is not set.
 *
 * @param transport - Current transport mode ("stdio" | "http"), attached as a tag.
 */
export function initSentry(transport: "stdio" | "http"): void {
	const dsn = process.env.SENTRY_DSN?.trim();
	if (!dsn) return; // Sentry disabled — no DSN configured

	Sentry.init({
		dsn,

		// SENTRY_ENVIRONMENT is read automatically by the SDK from the env var.
		// SENTRY_RELEASE: use the env var when set and non-empty, otherwise fall
		// back to the npm package version so every release is identifiable.
		release: process.env.SENTRY_RELEASE?.trim() || getVersionInfo().version,

		// ── GDPR/RODO compliance ───────────────────────────────────────────────
		sendDefaultPii: false, // never send IP, user-agent, cookies, or similar PII
		tracesSampleRate: 0, // disable performance tracing (could capture request payloads)
		// ──────────────────────────────────────────────────────────────────────

		// Remove integrations that auto-capture HTTP request/response data or
		// local variable values that may contain user-supplied OSM tag data.
		integrations: (defaults) =>
			defaults.filter(
				(i) => !DISABLED_INTEGRATIONS.includes(i.name as (typeof DISABLED_INTEGRATIONS)[number]),
			),

		// Defence-in-depth: strip any request or user data before the event
		// leaves the process, in case an integration we did not anticipate
		// attaches such data.
		beforeSend(event) {
			delete event.request; // never send request URLs, bodies, or headers
			delete event.user; // never send user identifiers

			// Filter breadcrumbs that may carry request or console data.
			// In Sentry SDK v10 event.breadcrumbs is a plain array.
			if (Array.isArray(event.breadcrumbs)) {
				event.breadcrumbs = event.breadcrumbs.filter(
					(b) => b.category !== "http" && b.category !== "fetch" && b.category !== "console",
				);
			}

			return event;
		},

		// Attach non-personal server metadata to every event.
		initialScope: {
			tags: { transport },
		},
	});
}

/**
 * Record a server startup lifecycle event.
 *
 * Successes are recorded as breadcrumbs (informational context for subsequent
 * errors). Failures are reported as exceptions so they surface in Sentry.
 * Safe no-op when Sentry is not initialised.
 *
 * @param phase   - Short identifier for the startup phase, e.g. "schema_warmup".
 * @param success - Whether the phase completed successfully.
 * @param error   - The error that caused the failure (only used when success is false).
 */
export function captureStartupEvent(phase: string, success: boolean, error?: Error): void {
	if (!Sentry.isInitialized()) return;

	if (success) {
		Sentry.addBreadcrumb({
			category: "startup",
			message: `${phase} succeeded`,
			level: "info",
		});
	} else {
		Sentry.captureException(error ?? new Error(`Startup failed: ${phase}`), {
			tags: { phase: `startup.${phase}` },
		});
	}
}

/**
 * Capture an unexpected exception thrown by a tool handler.
 *
 * Only the tool name (metadata) is attached — the tool arguments (which may
 * contain user-provided OSM tag data) are intentionally never sent.
 * Safe no-op when Sentry is not initialised.
 *
 * @param toolName - Name of the tool that threw, e.g. "validate_tag".
 * @param error    - The thrown value (any type).
 */
export function captureToolError(toolName: string, error: unknown): void {
	if (!Sentry.isInitialized()) return;

	Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
		tags: { tool: toolName },
	});
}
