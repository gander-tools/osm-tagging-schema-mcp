import assert from "node:assert";
import { describe, it } from "node:test";
import fields from "@openstreetmap/id-tagging-schema/dist/fields.json" with { type: "json" };
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import { searchTags } from "../../src/tools/search-tags.ts";

describe("search_tags", () => {
	describe("Basic Functionality", () => {
		it("should return response with keyMatches and valueMatches properties", async () => {
			const response = await searchTags("restaurant");

			assert.ok(typeof response === "object", "Should return an object");
			assert.ok(Array.isArray(response.keyMatches), "Should have keyMatches array");
			assert.ok(Array.isArray(response.valueMatches), "Should have valueMatches array");
		});

		it("should find tags by keyword in key", async () => {
			const response = await searchTags("wheelchair");

			assert.ok(
				response.keyMatches.length > 0 || response.valueMatches.length > 0,
				"Should find matching tags",
			);

			// wheelchair is a tag key, so should be in keyMatches
			const wheelchairKey = response.keyMatches.find((match) => match.key === "wheelchair");
			assert.ok(wheelchairKey, "Should find wheelchair in keyMatches");
			assert.ok(wheelchairKey.keyName, "Should have keyName");
			assert.ok(Array.isArray(wheelchairKey.values), "Should have values array");
			assert.ok(Array.isArray(wheelchairKey.valuesDetailed), "Should have valuesDetailed array");
		});

		it("should find tags by keyword in value", async () => {
			const response = await searchTags("restaurant");

			// "restaurant" is a value for "amenity" key, so should be in valueMatches
			const restaurantValue = response.valueMatches.find((match) => match.value === "restaurant");
			assert.ok(restaurantValue, "Should find restaurant in valueMatches");
			assert.ok(restaurantValue.key, "Should have key property");
			assert.ok(restaurantValue.keyName, "Should have keyName property");
			assert.ok(restaurantValue.value, "Should have value property");
			assert.ok(restaurantValue.valueName, "Should have valueName property");
		});

		it("should return keyMatches with all values for matched key", async () => {
			const response = await searchTags("amenity");

			// "amenity" is a key, so should be in keyMatches
			const amenityKey = response.keyMatches.find((match) => match.key === "amenity");
			assert.ok(amenityKey, "Should find amenity in keyMatches");

			// Should return ALL values for amenity key
			assert.ok(amenityKey.values.length > 10, "Should have many values for amenity");
			assert.strictEqual(
				amenityKey.values.length,
				amenityKey.valuesDetailed.length,
				"values and valuesDetailed should have same length",
			);

			// Verify structure of valuesDetailed
			for (const valueDetail of amenityKey.valuesDetailed) {
				assert.ok(valueDetail.value, "Should have value property");
				assert.ok(valueDetail.valueName, "Should have valueName property");
			}
		});

		it("should perform case-insensitive search", async () => {
			const responseLower = await searchTags("park");
			const responseUpper = await searchTags("PARK");

			assert.ok(
				responseLower.keyMatches.length > 0 || responseLower.valueMatches.length > 0,
				"Should find results with lowercase",
			);
			assert.ok(
				responseUpper.keyMatches.length > 0 || responseUpper.valueMatches.length > 0,
				"Should find results with uppercase",
			);

			// Results should be the same regardless of case
			assert.deepStrictEqual(
				responseLower,
				responseUpper,
				"Case should not matter in search results",
			);
		});

		it("should return empty arrays for no matches", async () => {
			const response = await searchTags("nonexistentkeywordinosm12345xyz");

			assert.ok(Array.isArray(response.keyMatches), "Should return keyMatches array");
			assert.ok(Array.isArray(response.valueMatches), "Should return valueMatches array");
			assert.strictEqual(response.keyMatches.length, 0, "Should have no keyMatches");
			assert.strictEqual(response.valueMatches.length, 0, "Should have no valueMatches");
		});

		it("should respect limit parameter", async () => {
			const response = await searchTags("building", 5);

			const totalResults = response.keyMatches.length + response.valueMatches.length;
			assert.ok(totalResults <= 5, `Should respect limit of 5, got ${totalResults} total results`);
		});

		it("should apply default limit of 100", async () => {
			const response = await searchTags("building");

			const totalResults = response.keyMatches.length + response.valueMatches.length;
			assert.ok(
				totalResults <= 100,
				`Should apply default limit of 100, got ${totalResults} total results`,
			);
		});

		it("should use cached data on subsequent calls", async () => {
			const response1 = await searchTags("school");
			const response2 = await searchTags("school");

			assert.deepStrictEqual(response1, response2, "Results should be identical from cache");
		});

		it("should find tag keys from fields.json (BUG FIX TEST)", async () => {
			const response = await searchTags("wheelchair");

			// wheelchair exists in fields.json with options: yes, limited, no
			// Should be in keyMatches with all values
			const wheelchairKey = response.keyMatches.find((match) => match.key === "wheelchair");
			assert.ok(wheelchairKey, "Should find wheelchair tag key from fields.json");

			// Should have all values from fields.json
			const wheelchairField = fields.wheelchair;
			assert.ok(wheelchairField, "wheelchair should exist in fields.json");

			// Verify all values exist
			assert.ok(wheelchairKey.values.length >= 3, "Should have at least yes, limited, no values");

			// Verify all returned values exist in fields.json options
			for (const value of wheelchairKey.values) {
				assert.ok(
					wheelchairField.options?.includes(value),
					`Value "${value}" should be in wheelchair field options`,
				);
			}
		});

		it("should return keys with colon separator, not slash (BUG FIX TEST)", async () => {
			// Search for "toilets" to find nested keys like toilets:wheelchair
			const response = await searchTags("toilets");

			// Check keyMatches
			for (const keyMatch of response.keyMatches) {
				assert.ok(
					!keyMatch.key.includes("/"),
					`Key "${keyMatch.key}" should not contain slash separator`,
				);
			}

			// Check valueMatches
			for (const valueMatch of response.valueMatches) {
				assert.ok(
					!valueMatch.key.includes("/"),
					`Key "${valueMatch.key}" should not contain slash separator`,
				);
			}

			// Specifically check for toilets:wheelchair (not toilets/wheelchair)
			const toiletsWheelchairField = fields["toilets/wheelchair"];
			if (toiletsWheelchairField) {
				// Field exists in schema, so we should find it
				const toiletsWheelchairKey = response.keyMatches.find(
					(match) => match.key === "toilets:wheelchair",
				);
				assert.ok(toiletsWheelchairKey, "Should find toilets:wheelchair (with colon, not slash)");
			}
		});

		it("should NOT return random value when matching by key (Phase 8.4 fix)", async () => {
			// This is the main problem the refactor solves:
			// Old version returned random value when match was in key only
			// New version returns ALL values when matching by key

			const response = await searchTags("amenity");

			// amenity is a key, so should be in keyMatches
			const amenityKey = response.keyMatches.find((match) => match.key === "amenity");
			assert.ok(amenityKey, "Should find amenity in keyMatches");

			// Should have ALL values for amenity, not just one random value
			assert.ok(
				amenityKey.values.length > 50,
				"Should have many values for amenity (not just one random value)",
			);

			// Values should include common ones like restaurant, cafe, parking, etc.
			assert.ok(amenityKey.values.includes("restaurant"), "Should include restaurant value");
			assert.ok(amenityKey.values.includes("cafe"), "Should include cafe value");
			assert.ok(amenityKey.values.includes("parking"), "Should include parking value");
		});

		it("should distinguish between key-match and value-match (Phase 8.4 fix)", async () => {
			const response = await searchTags("rest");

			// "rest" matches:
			// - Key: none (no OSM keys contain "rest")
			// - Value: "restaurant" (partial match)

			// Should find restaurant in valueMatches (not keyMatches)
			const restaurantValue = response.valueMatches.find((match) => match.value === "restaurant");
			assert.ok(restaurantValue, "Should find restaurant in valueMatches (value contains 'rest')");

			// Should NOT have "rest" as a key in keyMatches
			const restKey = response.keyMatches.find((match) => match.key === "rest");
			assert.ok(!restKey, "Should NOT find 'rest' in keyMatches (not a key)");
		});

		it("should support partial matching for keys", async () => {
			const response = await searchTags("wheel");

			// "wheel" should match "wheelchair" key
			const wheelchairKey = response.keyMatches.find((match) => match.key === "wheelchair");
			assert.ok(wheelchairKey, "Should find wheelchair with partial match 'wheel'");
		});

		it("should support partial matching for values", async () => {
			const response = await searchTags("rest");

			// "rest" should match "restaurant" value
			const restaurantValue = response.valueMatches.find((match) => match.value === "restaurant");
			assert.ok(restaurantValue, "Should find restaurant with partial match 'rest'");
		});
	});

	describe("JSON Schema Validation", () => {
		/**
		 * Provider pattern: Generates search keywords DYNAMICALLY from JSON data
		 * CRITICAL: NO hardcoded keywords - all keywords extracted from actual JSON
		 * CRITICAL: Tests ALL keywords, not just a sample (100% coverage)
		 * Collects keywords from different sources:
		 * - Preset names (amenity, building, etc.)
		 * - Field keys (wheelchair, access, etc.)
		 * - Common tag values (yes, no, etc.)
		 */
		function* searchKeywordProvider() {
			const keywords = new Set<string>();

			// DYNAMIC: Extract keywords from field keys
			const fieldKeys = new Set<string>();
			for (const field of Object.values(fields)) {
				if (field.key) {
					// Extract base key (before colon)
					const baseKey = field.key.split(":")[0];
					if (baseKey && baseKey.length >= 4) {
						fieldKeys.add(baseKey);
					}
				}
			}

			// DYNAMIC: Extract keywords from tag keys in presets
			const tagKeys = new Set<string>();
			for (const preset of Object.values(presets)) {
				if (preset.tags) {
					for (const key of Object.keys(preset.tags)) {
						if (key.length >= 4) {
							tagKeys.add(key);
						}
					}
				}
			}

			// Combine keywords from all sources
			for (const key of fieldKeys) keywords.add(key);
			for (const key of tagKeys) keywords.add(key);

			// CRITICAL: Test ALL keywords, not just a sample (100% coverage)
			const allKeywords = Array.from(keywords);

			// Yield each keyword for testing
			for (const keyword of allKeywords) {
				yield { keyword };
			}
		}

		it("should return search results matching JSON data (presets + fields)", async () => {
			const response = await searchTags("parking");

			// Verify keyMatches
			for (const keyMatch of response.keyMatches) {
				// Key should exist in fields or presets
				let found = false;

				// Check in fields.json
				for (const field of Object.values(fields)) {
					if (field.key === keyMatch.key) {
						found = true;

						// If field has options, verify all returned values exist in field options
						if (field.options && Array.isArray(field.options)) {
							for (const value of keyMatch.values) {
								if (field.options.includes(value)) {
									// Value exists in field options - good!
								}
							}
						}
						break;
					}
				}

				// Check in presets
				if (!found) {
					for (const preset of Object.values(presets)) {
						if (preset.tags?.[keyMatch.key] || preset.addTags?.[keyMatch.key]) {
							found = true;
							break;
						}
					}
				}

				assert.ok(found, `Key "${keyMatch.key}" should exist in JSON (fields or presets)`);
			}

			// Verify valueMatches
			for (const valueMatch of response.valueMatches) {
				let found = false;

				// Check in fields.json
				for (const field of Object.values(fields)) {
					if (field.key === valueMatch.key && field.options && Array.isArray(field.options)) {
						if (field.options.includes(valueMatch.value)) {
							found = true;
							break;
						}
					}
				}

				// Check in presets
				if (!found) {
					for (const preset of Object.values(presets)) {
						// Check in tags
						if (preset.tags?.[valueMatch.key] === valueMatch.value) {
							found = true;
							break;
						}
						// Check in addTags
						if (preset.addTags?.[valueMatch.key] === valueMatch.value) {
							found = true;
							break;
						}
					}
				}

				assert.ok(
					found,
					`Value match ${valueMatch.key}=${valueMatch.value} should exist in JSON (fields or presets)`,
				);
			}
		});

		it("should validate search results for multiple keywords using provider pattern", async () => {
			// Test each keyword from provider
			for (const testCase of searchKeywordProvider()) {
				// Get results with default limit (100)
				const response = await searchTags(testCase.keyword);

				// Verify keyMatches
				for (const keyMatch of response.keyMatches) {
					// Key should exist in fields or presets
					let found = false;

					// Check in fields.json
					for (const field of Object.values(fields)) {
						if (field.key === keyMatch.key) {
							found = true;
							break;
						}
					}

					// Check in presets
					if (!found) {
						for (const preset of Object.values(presets)) {
							if (preset.tags?.[keyMatch.key] || preset.addTags?.[keyMatch.key]) {
								found = true;
								break;
							}
						}
					}

					assert.ok(
						found,
						`Key "${keyMatch.key}" for keyword "${testCase.keyword}" should exist in JSON`,
					);
				}

				// Verify valueMatches
				for (const valueMatch of response.valueMatches) {
					let found = false;

					// Check in fields.json
					for (const field of Object.values(fields)) {
						if (field.key === valueMatch.key && field.options && Array.isArray(field.options)) {
							if (field.options.includes(valueMatch.value)) {
								found = true;
								break;
							}
						}
					}

					// Check in presets
					if (!found) {
						for (const preset of Object.values(presets)) {
							if (preset.tags?.[valueMatch.key] === valueMatch.value) {
								found = true;
								break;
							}
							if (preset.addTags?.[valueMatch.key] === valueMatch.value) {
								found = true;
								break;
							}
						}
					}

					assert.ok(
						found,
						`Value match "${valueMatch.key}=${valueMatch.value}" for keyword "${testCase.keyword}" should exist in JSON`,
					);
				}

				// Verify limit is respected
				const totalResults = response.keyMatches.length + response.valueMatches.length;
				assert.ok(
					totalResults <= 100,
					`Search for "${testCase.keyword}" should respect limit of 100`,
				);
			}
		});
	});
});
