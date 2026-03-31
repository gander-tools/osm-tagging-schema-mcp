/**
 * Sentry error monitoring integration (opt-in, GDPR/RODO compliant)
 *
 * Enabled only when the SENTRY_DSN environment variable is set.
 * When not set, every exported function is a safe no-op.
 *
 * GDPR/RODO compliance measures:
 * - sendDefaultPii: false   — no IP addresses, user-agents, or cookies
 * - tracesSampleRate: 0     — no performance tracing (avoids capturing request data)
 * - defaultIntegrations: false — opt-in only; prevents Sentry from auto-loading ~70
 *   framework/DB/AI integrations it detects in node_modules (Express, Mongo, Redis,
 *   OpenAI, Prisma, Kafka, …) that are not used by this server
 * - Only 6 minimal integrations are loaded explicitly (see below)
 * - beforeSend hook strips event.request and event.user as defence-in-depth
 * - Tool call arguments (user-provided OSM tag data) are NEVER sent; only the tool name is captured
 */

import * as Sentry from "@sentry/node";
import { getVersionInfo } from "../version.js";

/**
 * Initialise Sentry. Call once, before any async operations, as the very
 * first thing in main(). Safe no-op when SENTRY_DSN is not set.
 *
 * Returns true when the SDK is actually running (verified via
 * Sentry.isInitialized()), false when Sentry is disabled or failed to start.
 * Use the return value — not the presence of SENTRY_DSN — to determine
 * whether Sentry is active, as the SDK may decline to start for other reasons.
 *
 * @param transport - Current transport mode ("stdio" | "http"), attached as a tag.
 */
export function initSentry(transport: "stdio" | "http"): boolean {
	const dsn = process.env.SENTRY_DSN?.trim();
	if (!dsn) return false; // Sentry disabled — no DSN configured

	Sentry.init({
		dsn,

		// SENTRY_ENVIRONMENT is read automatically by the SDK from the env var.
		// SENTRY_RELEASE: use the env var when set and non-empty, otherwise fall
		// back to the npm package version so every release is identifiable.
		release: process.env.SENTRY_RELEASE?.trim() || getVersionInfo().version,

		// Enable Sentry SDK debug logging when SENTRY_DEBUG is set to any non-empty value.
		// Debug output goes to stderr and helps diagnose DSN misconfigurations,
		// transport errors, and dropped events without touching application logs.
		debug: Boolean(process.env.SENTRY_DEBUG?.trim()),

		// ── GDPR/RODO compliance ───────────────────────────────────────────────
		sendDefaultPii: false, // never send IP, user-agent, cookies, or similar PII
		tracesSampleRate: 0, // disable performance tracing (could capture request payloads)
		// ──────────────────────────────────────────────────────────────────────

		// Disable ALL auto-detected integrations (Sentry v10 probes node_modules
		// and loads ~70 integrations for Express, Mongo, Redis, OpenAI, Prisma, etc.
		// none of which are used by this server).
		// Only the 6 integrations listed below are loaded.
		defaultIntegrations: false,
		integrations: [
			Sentry.dedupeIntegration(), // suppress duplicate events
			Sentry.inboundFiltersIntegration(), // filter known-noisy error patterns
			Sentry.linkedErrorsIntegration(), // preserve error cause chains
			Sentry.onUncaughtExceptionIntegration(), // catch unhandled process crashes
			Sentry.onUnhandledRejectionIntegration(), // catch unhandled promise rejections
			Sentry.contextLinesIntegration(), // show source lines around the throw site
		],

		// Defence-in-depth: strip any request or user data before the event
		// leaves the process, in case a future SDK update attaches such data.
		beforeSend(event) {
			delete event.request; // never send request URLs, bodies, or headers
			delete event.user; // never send user identifiers
			// Filter breadcrumbs that may contain PII (URLs, request data, debug output)
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

	// Confirm using the SDK's own state, not just "DSN was set"
	return Sentry.isInitialized();
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

/**
 * Record a tool invocation as a breadcrumb for subsequent error context.
 *
 * Breadcrumbs do not generate Sentry issues on their own — they appear as
 * contextual trail on the next captured error event, showing which tools
 * were called before the failure.
 *
 * Only the tool name is recorded — arguments (user-provided OSM tag data)
 * are intentionally never sent.
 * Safe no-op when Sentry is not initialised.
 *
 * @param toolName - Name of the tool called, e.g. "validate_tag".
 */
export function captureToolUsage(toolName: string): void {
	if (!Sentry.isInitialized()) return;

	Sentry.captureMessage(toolName, {
		level: "info",
		extra: {
			category: "tool",
		},
	});

	Sentry.addBreadcrumb({
		category: "tool",
		message: toolName,
		level: "info",
	});
}

/**
 * Flush buffered events and shut down the Sentry SDK.
 *
 * Call once before process exit to ensure all captured events reach the
 * server.  Without this call, events buffered by the async transport are
 * silently lost when the process is terminated (SIGTERM, SIGINT, or
 * process.exit()).
 *
 * Safe no-op when Sentry is not initialised.
 *
 * @param timeout - Maximum time in ms to wait for the flush (default: 2000).
 * @returns true when all events were flushed, false on timeout or when Sentry is not active.
 */
export async function closeSentry(timeout = 2000): Promise<boolean> {
	if (!Sentry.isInitialized()) return false;
	return Sentry.close(timeout);
}
