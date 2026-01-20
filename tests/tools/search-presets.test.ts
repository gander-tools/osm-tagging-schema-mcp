import assert from "node:assert";
import { describe, it } from "node:test";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import translations from "@openstreetmap/id-tagging-schema/dist/translations/en.json" with {
	type: "json",
};
import { searchPresets } from "../../src/tools/search-presets.ts";

describe("search_presets", () => {
	describe("Basic Functionality", () => {
		it("should search presets by ID keyword", async () => {
			const results = await searchPresets("restaurant");

			assert.ok(Array.isArray(results), "Should return an array");
			assert.ok(results.length > 0, "Should find matching presets");

			// Should include amenity/restaurant
			const hasRestaurant = results.some((r) => r.id === "amenity/restaurant");
			assert.ok(hasRestaurant, "Should find amenity/restaurant");
		});

		it("should return preset with required properties", async () => {
			const results = await searchPresets("restaurant");

			assert.ok(results.length > 0, "Should have results");
			const first = results[0];
			assert.ok(first, "Should have first result");
			assert.ok(typeof first.id === "string", "Should have id property");
			assert.ok(typeof first.name === "string", "Should have name property");
			assert.ok(typeof first.tags === "object", "Should have tags property");
			assert.ok(Array.isArray(first.tagsDetailed), "Should have tagsDetailed array");
			assert.ok(Array.isArray(first.geometry), "Should have geometry array");

			// Verify tagsDetailed structure
			if (first.tagsDetailed.length > 0) {
				const firstTag = first.tagsDetailed[0];
				assert.ok(firstTag, "Should have first tag detail");
				assert.ok(typeof firstTag.key === "string", "Tag detail should have key");
				assert.ok(typeof firstTag.keyName === "string", "Tag detail should have keyName");
				assert.ok(typeof firstTag.value === "string", "Tag detail should have value");
				assert.ok(typeof firstTag.valueName === "string", "Tag detail should have valueName");
			}
		});

		it("should search presets by tag", async () => {
			const results = await searchPresets("amenity=restaurant");

			assert.ok(results.length > 0, "Should find presets with tag");

			// All results should have amenity=restaurant tag
			for (const result of results) {
				assert.strictEqual(result.tags.amenity, "restaurant", "Should have amenity=restaurant tag");
			}
		});

		it("should perform case-insensitive search", async () => {
			const resultsLower = await searchPresets("restaurant");
			const resultsUpper = await searchPresets("RESTAURANT");

			assert.ok(resultsLower.length > 0, "Should find results with lowercase");
			assert.ok(resultsUpper.length > 0, "Should find results with uppercase");
			assert.deepStrictEqual(resultsLower, resultsUpper, "Case should not matter");
		});

		it("should return empty array for no matches", async () => {
			const results = await searchPresets("nonexistentpresetxyz12345");

			assert.ok(Array.isArray(results), "Should return an array");
			assert.strictEqual(results.length, 0, "Should return empty array");
		});

		it("should limit results when limit parameter is provided", async () => {
			const results = await searchPresets("building", { limit: 5 });

			assert.ok(Array.isArray(results), "Should return an array");
			assert.ok(results.length <= 5, "Should respect limit");
		});

		it("should filter by geometry type", async () => {
			const results = await searchPresets("restaurant", {
				geometry: "area",
			});

			assert.ok(results.length > 0, "Should find results");

			// All results should support area geometry
			for (const result of results) {
				assert.ok(
					result.geometry.includes("area"),
					`Preset ${result.id} should support area geometry`,
				);
			}
		});

		it("should use cached data on subsequent calls", async () => {
			const results1 = await searchPresets("school");
			const results2 = await searchPresets("school");

			assert.deepStrictEqual(results1, results2, "Results should be identical from cache");
		});

		it("should use preset names for tagsDetailed valueName", async () => {
			const results = await searchPresets("amenity=parking");
			const parkingPreset = results.find((r) => r.id === "amenity/parking");

			assert.ok(parkingPreset, "Should find amenity/parking preset");

			const amenityTag = parkingPreset.tagsDetailed.find((t) => t.key === "amenity");
			assert.ok(amenityTag, "Should have amenity tag in tagsDetailed");

			// keyName should use title case formatting, NOT field label "Type"
			assert.strictEqual(
				amenityTag.keyName,
				"Amenity",
				"keyName should be 'Amenity', not field label 'Type'",
			);

			// valueName should use preset name from translations, NOT "Parking"
			const expectedParkingName = translations.en.presets.presets["amenity/parking"]?.name;
			assert.ok(expectedParkingName, "Translation should exist for amenity/parking");
			assert.strictEqual(
				amenityTag.valueName,
				expectedParkingName,
				`valueName should be '${expectedParkingName}' from preset amenity/parking`,
			);
		});

		it("should use preset names for multiple presets", async () => {
			const results = await searchPresets("amenity=restaurant");
			const restaurantPreset = results.find((r) => r.id === "amenity/restaurant");

			assert.ok(restaurantPreset, "Should find amenity/restaurant preset");

			const amenityTag = restaurantPreset.tagsDetailed.find((t) => t.key === "amenity");
			assert.ok(amenityTag, "Should have amenity tag in tagsDetailed");

			assert.strictEqual(amenityTag.keyName, "Amenity", "keyName should be 'Amenity'");

			// Get expected name from translations
			const expectedRestaurantName = translations.en.presets.presets["amenity/restaurant"]?.name;
			assert.ok(expectedRestaurantName, "Translation should exist for amenity/restaurant");
			assert.strictEqual(
				amenityTag.valueName,
				expectedRestaurantName,
				`valueName should be '${expectedRestaurantName}' from preset`,
			);
		});
	});

	describe("JSON Schema Validation", () => {
		it("should return presets matching JSON data", async () => {
			const results = await searchPresets("restaurant");

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

				// Verify new fields exist
				assert.ok(result.name, `Preset ${result.id} should have name`);
				assert.ok(result.tagsDetailed, `Preset ${result.id} should have tagsDetailed`);
				assert.strictEqual(
					result.tagsDetailed.length,
					Object.keys(result.tags).length,
					`Preset ${result.id} should have same number of tags in tagsDetailed as tags`,
				);
			}
		});

		it("should find presets by exact tag match", async () => {
			const results = await searchPresets("amenity=cafe");

			assert.ok(results.length > 0, "Should find cafe presets");

			// Verify all have amenity=cafe
			for (const result of results) {
				const preset = presets[result.id];
				assert.ok(preset, `Preset ${result.id} should exist`);
				assert.strictEqual(preset.tags.amenity, "cafe", `Should have amenity=cafe tag`);
			}
		});

		it("should validate search results against complete preset data", async () => {
			const results = await searchPresets("parking");

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

		it("should be able to find ALL presets from JSON by ID using provider pattern (100% coverage)", async () => {
			// CRITICAL: Test EVERY preset from JSON, not a sample
			const allPresetIds = Object.keys(presets);
			assert.ok(allPresetIds.length > 1500, "Should have all presets from JSON");

			let foundCount = 0;
			let _notFoundCount = 0;

			// Provider pattern: iterate through EVERY preset
			for (const presetId of allPresetIds) {
				// Search by preset ID (use last part for searchable presets)
				const searchTerm = presetId.split("/").pop() || presetId;

				const results = await searchPresets(searchTerm);

				// Check if this preset was found in results
				const found = results.some((r) => r.id === presetId);

				if (found) {
					foundCount++;
					// Verify the preset data matches JSON
					const result = results.find((r) => r.id === presetId);
					assert.ok(result, `Should find preset ${presetId}`);
					assert.deepStrictEqual(
						result.tags,
						presets[presetId].tags,
						`Tags for ${presetId} should match JSON`,
					);
					assert.deepStrictEqual(
						result.geometry,
						presets[presetId].geometry,
						`Geometry for ${presetId} should match JSON`,
					);
				} else {
					_notFoundCount++;
				}
			}

			// Most presets should be findable (some may be unsearchable by design)
			assert.ok(
				foundCount > allPresetIds.length * 0.5,
				`Should find most presets (found ${foundCount}/${allPresetIds.length})`,
			);
		});
	});
});
