/**
 * Integration tests for get_preset_details tool (Phase 8.5)
 */

import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import { setupClientServer, type TestServer, teardownClientServer } from "./helpers.js";

describe("get_preset_details integration", () => {
	let client: Client;
	let server: TestServer;

	beforeEach(async () => {
		({ client, server } = await setupClientServer());
	});

	afterEach(async () => {
		await teardownClientServer(client, server);
	});

	describe("Basic Functionality", () => {
		it("should call get_preset_details tool successfully", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			assert.ok(response);
			assert.ok(response.content);
			assert.ok(Array.isArray(response.content));
			assert.strictEqual(response.content.length, 1);
			assert.strictEqual(response.content[0]?.type, "text");

			// Parse the result from the response
			const result = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(result);
			assert.strictEqual(result.id, "amenity/restaurant");
		});

		it("should return all required properties via MCP (Phase 8.5 format)", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);

			// Required properties (Phase 8.5)
			assert.ok(result.id, "Should have id");
			assert.ok(result.name, "Should have name (required in Phase 8.5)");
			assert.ok(result.tags, "Should have tags");
			assert.ok(result.tagsDetailed, "Should have tagsDetailed (Phase 8.5)");
			assert.ok(result.geometry, "Should have geometry");

			// Type validation
			assert.strictEqual(typeof result.id, "string");
			assert.strictEqual(typeof result.name, "string");
			assert.strictEqual(typeof result.tags, "object");
			assert.ok(Array.isArray(result.tagsDetailed));
			assert.ok(Array.isArray(result.geometry));

			// icon removed in Phase 8.5
			assert.strictEqual(result.icon, undefined, "Icon should not be present");
		});

		it("should return tagsDetailed with correct structure via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);

			assert.ok(Array.isArray(result.tagsDetailed));
			assert.ok(result.tagsDetailed.length > 0);

			// Verify each tag detail
			for (const tagDetail of result.tagsDetailed) {
				assert.strictEqual(typeof tagDetail.key, "string");
				assert.strictEqual(typeof tagDetail.keyName, "string");
				assert.strictEqual(typeof tagDetail.value, "string");
				assert.strictEqual(typeof tagDetail.valueName, "string");

				// Verify key/value match tags object
				assert.strictEqual(result.tags[tagDetail.key], tagDetail.value);
			}
		});
	});

	describe("Multiple Input Formats", () => {
		it("should accept preset ID format via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);
			assert.strictEqual(result.id, "amenity/restaurant");
		});

		it("should accept tag notation format via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity=restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);
			assert.strictEqual(result.id, "amenity/restaurant");
		});

		it("should accept JSON object format via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: { amenity: "restaurant" } },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);
			assert.strictEqual(result.id, "amenity/restaurant");
		});
	});

	describe("JSON Schema Data Integrity", () => {
		it("should return preset details matching JSON data via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);
			const expected = presets["amenity/restaurant"];

			assert.ok(expected, "Preset should exist in JSON");

			// Verify required properties (backward compatibility)
			assert.strictEqual(result.id, "amenity/restaurant");
			assert.deepStrictEqual(result.tags, expected.tags);
			assert.deepStrictEqual(result.geometry, expected.geometry);

			// Verify Phase 8.5 additions
			assert.ok(result.name, "Name should be present (required in Phase 8.5)");
			assert.ok(result.tagsDetailed, "tagsDetailed should be present (Phase 8.5)");

			// icon removed in Phase 8.5
			assert.strictEqual(result.icon, undefined, "Icon should not be present");

			// Fields should not be a reference
			if (result.fields) {
				for (const field of result.fields) {
					assert.ok(!field.startsWith("{"), `Field "${field}" should not be a reference`);
				}
			}
			if (result.moreFields) {
				for (const field of result.moreFields) {
					assert.ok(!field.startsWith("{"), `moreField "${field}" should not be a reference`);
				}
			}
		});

		it("should validate preset details for ALL presets via MCP (100% coverage)", async () => {
			// CRITICAL: Test ALL presets, not just a sample
			const allPresetIds = Object.keys(presets);

			for (const presetId of allPresetIds) {
				const response = await client.callTool({
					name: "get_preset_details",
					arguments: { presetId },
				});

				const result = JSON.parse((response.content[0] as { text: string }).text);
				const expected = presets[presetId];

				assert.ok(expected, `Preset ${presetId} should exist in JSON`);
				assert.strictEqual(result.id, presetId);

				// Verify tags and geometry match (backward compatibility)
				assert.deepStrictEqual(result.tags, expected.tags);
				assert.deepStrictEqual(result.geometry, expected.geometry);

				// Verify Phase 8.5 additions
				assert.ok(result.name, `Name should be present for ${presetId}`);
				assert.strictEqual(typeof result.name, "string");
				assert.ok(result.tagsDetailed, `tagsDetailed should be present for ${presetId}`);
				assert.ok(Array.isArray(result.tagsDetailed));

				// icon removed in Phase 8.5
				assert.strictEqual(result.icon, undefined, `Icon should not be present for ${presetId}`);

				// v7 resolves references at build time: fields pass through unchanged, no {...}
				assert.deepStrictEqual(
					result.fields ?? [],
					expected.fields ?? [],
					`fields for ${presetId}`,
				);
				assert.deepStrictEqual(
					result.moreFields ?? [],
					expected.moreFields ?? [],
					`moreFields for ${presetId}`,
				);
				for (const field of [...(result.fields ?? []), ...(result.moreFields ?? [])]) {
					assert.ok(
						!field.startsWith("{"),
						`Field "${field}" in ${presetId} should not be a reference`,
					);
				}
			}
		});

		it("should return field arrays via MCP", async () => {
			const response = await client.callTool({
				name: "get_preset_details",
				arguments: { presetId: "amenity/restaurant" },
			});

			const result = JSON.parse((response.content[0] as { text: string }).text);

			// Restaurant should have fields
			assert.ok(result.fields, "Restaurant should have fields");
			assert.ok(Array.isArray(result.fields));

			// Verify each field is a string and not a reference
			for (const field of result.fields) {
				assert.strictEqual(typeof field, "string", "Field should be a string");
				assert.ok(!field.startsWith("{"), `Field "${field}" should not be a reference`);
			}
		});
	});
});
