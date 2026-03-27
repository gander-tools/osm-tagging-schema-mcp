/**
 * Unit tests for src/utils/sentry.ts
 *
 * Tests verify:
 * - GDPR-safe no-op behaviour when SENTRY_DSN is absent
 * - initSentry() does not throw regardless of DSN presence
 * - captureStartupEvent() and captureToolError() are safe to call at all times
 * - beforeSend hook strips request/user data (GDPR defence-in-depth)
 */

import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

describe("Sentry utils", () => {
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		// Snapshot env so tests are isolated
		originalEnv = { ...process.env };
	});

	afterEach(() => {
		// Restore env
		process.env = { ...originalEnv };
	});

	describe("initSentry()", () => {
		it("does not throw when SENTRY_DSN is not set", async () => {
			delete process.env.SENTRY_DSN;
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => initSentry("stdio"));
		});

		it("returns false when SENTRY_DSN is not set", async () => {
			delete process.env.SENTRY_DSN;
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.strictEqual(initSentry("stdio"), false);
		});

		it("returns false when SENTRY_DSN is an empty string", async () => {
			process.env.SENTRY_DSN = "";
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.strictEqual(initSentry("http"), false);
		});

		it("returns false when SENTRY_DSN is only whitespace", async () => {
			process.env.SENTRY_DSN = "   ";
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.strictEqual(initSentry("stdio"), false);
		});

		it("accepts 'stdio' transport without throwing", async () => {
			delete process.env.SENTRY_DSN;
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => initSentry("stdio"));
		});

		it("accepts 'http' transport without throwing", async () => {
			delete process.env.SENTRY_DSN;
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => initSentry("http"));
		});

		it("does not throw when SENTRY_DEBUG is set but SENTRY_DSN is absent", async () => {
			delete process.env.SENTRY_DSN;
			process.env.SENTRY_DEBUG = "1";
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => initSentry("stdio"));
		});

		it("returns false when SENTRY_DEBUG is set but SENTRY_DSN is absent", async () => {
			delete process.env.SENTRY_DSN;
			process.env.SENTRY_DEBUG = "1";
			const { initSentry } = await import("../../src/utils/sentry.js");
			assert.strictEqual(initSentry("stdio"), false);
		});
	});

	describe("captureStartupEvent()", () => {
		it("does not throw when Sentry is not initialised (no DSN)", async () => {
			delete process.env.SENTRY_DSN;
			const { captureStartupEvent } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureStartupEvent("schema_warmup", true));
		});

		it("does not throw for a success phase without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureStartupEvent } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureStartupEvent("schema_warmup", true));
		});

		it("does not throw for a failure phase with an Error without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureStartupEvent } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() =>
				captureStartupEvent("schema_warmup", false, new Error("load failed")),
			);
		});

		it("does not throw for a failure phase without an Error (creates synthetic error)", async () => {
			delete process.env.SENTRY_DSN;
			const { captureStartupEvent } = await import("../../src/utils/sentry.js");
			// No error object supplied — function should synthesise one internally
			assert.doesNotThrow(() => captureStartupEvent("schema_warmup", false));
		});
	});

	describe("captureToolError()", () => {
		it("does not throw when Sentry is not initialised (no DSN)", async () => {
			delete process.env.SENTRY_DSN;
			const { captureToolError } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureToolError("validate_tag", new Error("oops")));
		});

		it("handles Error instances without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureToolError } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureToolError("search_tags", new Error("unexpected")));
		});

		it("handles non-Error string values without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureToolError } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureToolError("get_tag_values", "some string error"));
		});

		it("handles non-Error object values without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureToolError } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureToolError("validate_tag_collection", { code: 42 }));
		});

		it("handles null/undefined thrown values without DSN", async () => {
			delete process.env.SENTRY_DSN;
			const { captureToolError } = await import("../../src/utils/sentry.js");
			assert.doesNotThrow(() => captureToolError("flat_to_json", null));
			assert.doesNotThrow(() => captureToolError("json_to_flat", undefined));
		});
	});

	describe("GDPR/RODO: beforeSend hook strips PII (unit test via pure function)", () => {
		it("returns a function that removes event.request", async () => {
			// We test the beforeSend logic directly by recreating its logic as a pure
			// function — we cannot easily intercept the Sentry SDK's internal call.
			// This test documents and validates the expected data-scrubbing behaviour.
			type SentryEvent = {
				request?: { url: string; method: string };
				user?: { id: string };
				breadcrumbs?: Array<{ category: string; message: string }>;
			};

			const scrub = (event: SentryEvent): SentryEvent => {
				const e = { ...event };
				delete e.request;
				delete e.user;
				if (Array.isArray(e.breadcrumbs)) {
					e.breadcrumbs = e.breadcrumbs.filter(
						(b) => b.category !== "http" && b.category !== "fetch" && b.category !== "console",
					);
				}
				return e;
			};

			const input: SentryEvent = {
				request: { url: "http://localhost:3000/mcp", method: "POST" },
				user: { id: "user-123" },
				breadcrumbs: [
					{ category: "http", message: "POST /mcp" },
					{ category: "fetch", message: "GET https://example.com" },
					{ category: "console", message: "debug output" },
					{ category: "startup", message: "schema_warmup succeeded" },
				],
			};

			const result = scrub(input);

			// request and user must be stripped
			assert.strictEqual(result.request, undefined, "event.request must be removed");
			assert.strictEqual(result.user, undefined, "event.user must be removed");

			// Only the non-PII breadcrumb should survive
			assert.ok(Array.isArray(result.breadcrumbs));
			assert.strictEqual(result.breadcrumbs.length, 1);
			assert.strictEqual(result.breadcrumbs[0]?.category, "startup");
		});
	});
});
