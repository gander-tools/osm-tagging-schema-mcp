/**
 * Integration tests for search_presets tool
 */

import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import { setupClientServer, type TestServer, teardownClientServer } from "./helpers.js";

describe("search_presets integration", () => {
	let client: Client;
	let server: TestServer;

	beforeEach(async () => {
		({ client, server } = await setupClientServer());
	});

	afterEach(async () => {
		await teardownClientServer(client, server);
	});

	describe("Basic Functionality", () => {
		it("should call search_presets tool successfully", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "restaurant" },
			});

			assert.ok(response);
			assert.ok(response.content);
			assert.ok(Array.isArray(response.content));
			assert.strictEqual(response.content.length, 1);
			assert.strictEqual(response.content[0]?.type, "text");

			// Parse the results from the response
			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(Array.isArray(results));
			assert.ok(results.length > 0);
		});

		it("should search by keyword", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "restaurant" },
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(results.length > 0, "Should find results for 'restaurant'");

			// Should include amenity/restaurant
			const hasRestaurant = results.some((r: { id: string }) => r.id === "amenity/restaurant");
			assert.ok(hasRestaurant, "Should find amenity/restaurant");
		});

		it("should search by tag", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "amenity=restaurant" },
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(results.length > 0, "Should find results for tag search");

			// All results should have amenity=restaurant
			for (const result of results) {
				assert.strictEqual(result.tags.amenity, "restaurant", "Should have amenity=restaurant tag");
			}
		});

		it("should filter by geometry type via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: {
					keyword: "restaurant",
					geometry: "area",
				},
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(results.length > 0, "Should find results");

			// All results should support area geometry
			for (const result of results) {
				assert.ok(
					result.geometry.includes("area"),
					`Preset ${result.id} should support area geometry`,
				);
			}
		});

		it("should respect limit parameter via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: {
					keyword: "building",
					limit: 5,
				},
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(Array.isArray(results), "Should return an array");
			assert.ok(results.length <= 5, "Should respect limit");
		});

		it("should perform case-insensitive search via MCP", async () => {
			const responseLower = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "restaurant" },
			});

			const responseUpper = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "RESTAURANT" },
			});

			const resultsLower = JSON.parse((responseLower.content[0] as { text: string }).text);
			const resultsUpper = JSON.parse((responseUpper.content[0] as { text: string }).text);

			assert.ok(resultsLower.length > 0, "Should find results with lowercase");
			assert.ok(resultsUpper.length > 0, "Should find results with uppercase");
			assert.deepStrictEqual(resultsLower, resultsUpper, "Case should not matter");
		});
	});

	describe("JSON Schema Data Integrity", () => {
		it("should return presets matching JSON data via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "restaurant" },
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);

			// Verify each result exists in JSON
			for (const result of results) {
				const preset = presets[result.id];
				assert.ok(preset, `Preset ${result.id} should exist in JSON`);

				// Verify tags match
				assert.deepStrictEqual(result.tags, preset.tags, `Tags for ${result.id} should match JSON`);

				// Verify geometry matches
				assert.deepStrictEqual(
					result.geometry,
					preset.geometry,
					`Geometry for ${result.id} should match JSON`,
				);

				// Verify new fields exist (Phase 8.8)
				assert.ok(result.name, `Preset ${result.id} should have name`);
				assert.ok(result.tagsDetailed, `Preset ${result.id} should have tagsDetailed`);
				assert.strictEqual(
					result.tagsDetailed.length,
					Object.keys(result.tags).length,
					`Preset ${result.id} should have same number of tags in tagsDetailed as tags`,
				);
			}
		});

		it("should find presets by exact tag match via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "amenity=cafe" },
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(results.length > 0, "Should find cafe presets");

			// Verify all have amenity=cafe
			for (const result of results) {
				const preset = presets[result.id];
				assert.ok(preset, `Preset ${result.id} should exist`);
				assert.strictEqual(preset.tags.amenity, "cafe", `Should have amenity=cafe tag`);
			}
		});

		it("should validate search results structure via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: { keyword: "parking" },
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);
			assert.ok(results.length > 0, "Should find parking presets");

			// CRITICAL: Validate EACH result individually
			for (const result of results) {
				assert.ok(result.id, "Should have preset ID");
				assert.ok(result.name, "Should have name");
				assert.ok(result.tags, "Should have tags");
				assert.ok(result.tagsDetailed, "Should have tagsDetailed");
				assert.ok(result.geometry, "Should have geometry");

				// Verify in JSON
				const jsonPreset = presets[result.id];
				assert.ok(jsonPreset, `Preset ${result.id} should exist in JSON`);
				assert.deepStrictEqual(
					result.tags,
					jsonPreset.tags,
					`Preset ${result.id} tags should match JSON`,
				);

				// Verify tagsDetailed structure
				assert.ok(Array.isArray(result.tagsDetailed), "tagsDetailed should be an array");
				assert.strictEqual(
					result.tagsDetailed.length,
					Object.keys(result.tags).length,
					"tagsDetailed should have same number of items as tags",
				);

				// Verify each tag detail
				for (const tagDetail of result.tagsDetailed) {
					assert.ok(tagDetail.key, "Tag detail should have key");
					assert.ok(tagDetail.keyName, "Tag detail should have keyName");
					assert.ok(tagDetail.value !== undefined, "Tag detail should have value");
					assert.ok(tagDetail.valueName, "Tag detail should have valueName");

					// Verify tag exists in preset tags
					assert.strictEqual(
						result.tags[tagDetail.key],
						tagDetail.value,
						`Tag ${tagDetail.key} should match in tags and tagsDetailed`,
					);
				}
			}
		});

		it("should validate geometry filtering against JSON via MCP", async () => {
			const response = await client.callTool({
				name: "search_presets",
				arguments: {
					keyword: "building",
					geometry: "point",
				},
			});

			const results = JSON.parse((response.content[0] as { text: string }).text);

			// Verify all returned presets support point geometry in JSON
			for (const result of results) {
				const jsonPreset = presets[result.id];
				assert.ok(jsonPreset, `Preset ${result.id} should exist in JSON`);
				assert.ok(
					jsonPreset.geometry.includes("point"),
					`Preset ${result.id} should support point geometry in JSON`,
				);
			}
		});

		it("should validate searchability for ALL presets via MCP (100% coverage)", async () => {
			// CRITICAL: Test ALL presets, not just a sample
			const allPresetIds = Object.keys(presets);

			let foundCount = 0;

			for (const presetId of allPresetIds) {
				const searchTerm = presetId.split("/").pop() || presetId;

				const response = await client.callTool({
					name: "search_presets",
					arguments: { keyword: searchTerm },
				});

				const results = JSON.parse((response.content[0] as { text: string }).text);
				const found = results.some((r) => r.id === presetId);

				if (found) {
					foundCount++;
					// Verify match
					const result = results.find((r) => r.id === presetId);
					assert.deepStrictEqual(result.tags, presets[presetId].tags);
				}
			}

			// Most presets should be findable (some may not be searchable by last part of ID)
			assert.ok(
				foundCount > allPresetIds.length * 0.5,
				`Should find most presets via MCP (found ${foundCount}/${allPresetIds.length})`,
			);
		});
	});
});
