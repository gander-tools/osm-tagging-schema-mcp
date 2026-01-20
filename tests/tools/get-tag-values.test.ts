import assert from "node:assert";
import { describe, it } from "node:test";
import fields from "@openstreetmap/id-tagging-schema/dist/fields.json" with { type: "json" };
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import translations from "@openstreetmap/id-tagging-schema/dist/translations/en.json" with {
	type: "json",
};
import { getTagValues } from "../../src/tools/get-tag-values.ts";

describe("get_tag_values", () => {
	describe("Basic Functionality", () => {
		it("should return response object with key, keyName, values, and valuesDetailed", async () => {
			const response = await getTagValues("amenity");

			// Validate response structure
			assert.ok(typeof response === "object", "Should return an object");
			assert.ok("key" in response, "Should have 'key' field");
			assert.ok("keyName" in response, "Should have 'keyName' field");
			assert.ok("values" in response, "Should have 'values' field");
			assert.ok("valuesDetailed" in response, "Should have 'valuesDetailed' field");

			// Validate field types
			assert.strictEqual(typeof response.key, "string", "key should be a string");
			assert.strictEqual(typeof response.keyName, "string", "keyName should be a string");
			assert.ok(Array.isArray(response.values), "values should be an array");
			assert.ok(Array.isArray(response.valuesDetailed), "valuesDetailed should be an array");

			// Validate key is correct
			assert.strictEqual(response.key, "amenity", "key should match input");
		});

		it("should return keyName as title case formatted name (NOT field label)", async () => {
			const response = await getTagValues("amenity");

			// keyName should be title case formatted, NOT field label from fields.json
			assert.ok(response.keyName.length > 0, "keyName should not be empty");
			assert.strictEqual(typeof response.keyName, "string", "keyName should be a string");
			assert.strictEqual(response.keyName, "Amenity", "keyName should be title case formatted");
		});

		it("should NOT use field label for parking key", async () => {
			const response = await getTagValues("parking");

			// CRITICAL: Should NOT return "Type" (field label from fields.json)
			// Should return "Parking" (title case formatted name)
			assert.strictEqual(
				response.keyName,
				"Parking",
				"Should use title case formatting, NOT field label 'Type'",
			);
		});

		it("should NOT use field label for parking_space key", async () => {
			const response = await getTagValues("parking_space");

			// CRITICAL: Should NOT return "Type" (field label from fields.json)
			// Should return "Parking Space" (title case formatted name)
			assert.strictEqual(
				response.keyName,
				"Parking Space",
				"Should use title case formatting, NOT field label 'Type'",
			);
		});

		it("should return values as simple string array", async () => {
			const response = await getTagValues("amenity");

			assert.ok(Array.isArray(response.values), "values should be an array");
			assert.ok(response.values.length > 0, "values should have at least one item");

			// Each value should be a string
			for (const value of response.values) {
				assert.strictEqual(typeof value, "string", "Each value should be a string");
			}
		});

		it("should return valuesDetailed with value and valueName fields", async () => {
			const response = await getTagValues("amenity");

			assert.ok(Array.isArray(response.valuesDetailed), "valuesDetailed should be an array");
			assert.ok(response.valuesDetailed.length > 0, "valuesDetailed should have at least one item");

			// Each item should have value and valueName (NO description field)
			for (const item of response.valuesDetailed) {
				assert.ok(typeof item === "object", "Each item should be an object");
				assert.ok("value" in item, "Each item should have 'value' field");
				assert.ok("valueName" in item, "Each item should have 'valueName' field");
				assert.strictEqual(typeof item.value, "string", "value should be a string");
				assert.strictEqual(typeof item.valueName, "string", "valueName should be a string");

				// CRITICAL: NO description field in new format
				assert.ok(
					!("description" in item),
					"Should NOT have 'description' field (removed in refactor)",
				);
			}
		});

		it("should use preset names for valueName when preset exists", async () => {
			const response = await getTagValues("amenity");

			// Find "parking" value - should have valueName from preset "amenity/parking"
			const parkingValue = response.valuesDetailed.find((v) => v.value === "parking");
			assert.ok(parkingValue, "Should have parking value");

			// Get expected name from translations
			const expectedParkingName = translations.en.presets.presets["amenity/parking"]?.name;
			assert.ok(expectedParkingName, "Translation should exist for amenity/parking");
			assert.strictEqual(
				parkingValue.valueName,
				expectedParkingName,
				`Should use preset name '${expectedParkingName}' from amenity/parking preset`,
			);

			// Find "restaurant" value - should have valueName from preset
			const restaurantValue = response.valuesDetailed.find((v) => v.value === "restaurant");
			assert.ok(restaurantValue, "Should have restaurant value");

			// Get expected name from translations
			const expectedRestaurantName = translations.en.presets.presets["amenity/restaurant"]?.name;
			assert.ok(expectedRestaurantName, "Translation should exist for amenity/restaurant");
			assert.strictEqual(
				restaurantValue.valueName,
				expectedRestaurantName,
				`Should use preset name '${expectedRestaurantName}' from amenity/restaurant preset`,
			);
		});

		it("should have matching counts between values and valuesDetailed", async () => {
			const response = await getTagValues("amenity");

			assert.strictEqual(
				response.values.length,
				response.valuesDetailed.length,
				"values and valuesDetailed should have same length",
			);
		});

		it("should have matching values in values and valuesDetailed arrays", async () => {
			const response = await getTagValues("amenity");

			// Each value in values array should match corresponding valuesDetailed[].value
			for (let i = 0; i < response.values.length; i++) {
				assert.strictEqual(
					response.values[i],
					response.valuesDetailed[i].value,
					`values[${i}] should match valuesDetailed[${i}].value`,
				);
			}
		});

		it("should return unique values only", async () => {
			const response = await getTagValues("amenity");

			const uniqueValues = new Set(response.values);
			assert.strictEqual(
				response.values.length,
				uniqueValues.size,
				"Should return unique values only",
			);
		});

		it("should return sorted values", async () => {
			const response = await getTagValues("amenity");

			const sorted = [...response.values].sort();
			assert.deepStrictEqual(response.values, sorted, "Values should be sorted");
		});

		it("should return empty values arrays for non-existent tag key", async () => {
			const response = await getTagValues("nonexistent_tag_key_12345");

			assert.ok(typeof response === "object", "Should return response object");
			assert.strictEqual(response.key, "nonexistent_tag_key_12345", "Should have correct key");
			assert.ok(Array.isArray(response.values), "values should be an array");
			assert.strictEqual(response.values.length, 0, "values should be empty");
			assert.ok(Array.isArray(response.valuesDetailed), "valuesDetailed should be an array");
			assert.strictEqual(response.valuesDetailed.length, 0, "valuesDetailed should be empty");
		});

		it("should use cached data on subsequent calls", async () => {
			const response1 = await getTagValues("amenity");
			const response2 = await getTagValues("amenity");

			assert.deepStrictEqual(response1, response2, "Responses should be identical from cache");
		});

		it("should handle tag keys with special characters", async () => {
			const response = await getTagValues("building");

			assert.ok(typeof response === "object", "Should return response object");
			// Should not throw error
		});

		it("should accept keys with colon separator (BUG FIX TEST)", async () => {
			// toilets:wheelchair is a field stored as "toilets/wheelchair" in fields map
			// but should accept "toilets:wheelchair" as input (OSM format)
			const response = await getTagValues("toilets:wheelchair");

			assert.ok(typeof response === "object", "Should return response object");
			assert.strictEqual(response.key, "toilets:wheelchair", "Should have correct key");
			assert.ok(response.values.length > 0, "Should find values for colon-formatted key");

			// Verify values match the field definition
			const toiletsWheelchairField = fields["toilets/wheelchair"];
			if (toiletsWheelchairField?.options) {
				for (const value of response.values) {
					assert.ok(
						toiletsWheelchairField.options.includes(value),
						`Value "${value}" should be in field options`,
					);
				}
			}
		});
	});

	describe("JSON Schema Validation", () => {
		/**
		 * Provider pattern: Generates tag keys with their expected values from JSON
		 * Tests ALL tag keys to ensure 100% comprehensive validation (CRITICAL RULE)
		 */
		function* tagKeyProvider() {
			// CRITICAL: Collect ALL unique tag keys from JSON (fields + presets)
			const allKeys = new Set<string>();

			// Collect from fields - use field.key (actual OSM key with colon)
			// not the map key (which uses slash separator)
			for (const field of Object.values(fields)) {
				if (field.key) {
					allKeys.add(field.key);
				}
			}

			// Collect from presets
			for (const preset of Object.values(presets)) {
				if (preset.tags) {
					for (const key of Object.keys(preset.tags)) {
						allKeys.add(key);
					}
				}
				if (preset.addTags) {
					for (const key of Object.keys(preset.addTags)) {
						allKeys.add(key);
					}
				}
			}

			// CRITICAL: Test EVERY key, not just a sample
			for (const key of allKeys) {
				const expectedValues = new Set<string>();

				// First, collect values from fields if available
				// Fields are stored with slash separator, so convert key
				const fieldKeyLookup = key.replace(/:/g, "/");
				const field = fields[fieldKeyLookup];
				if (field?.options && Array.isArray(field.options)) {
					for (const option of field.options) {
						if (typeof option === "string") {
							expectedValues.add(option);
						}
					}
				}

				// Then collect values from JSON presets
				for (const preset of Object.values(presets)) {
					if (preset.tags?.[key]) {
						const value = preset.tags[key];
						if (value && value !== "*" && !value.includes("|")) {
							expectedValues.add(value);
						}
					}
					if (preset.addTags?.[key]) {
						const value = preset.addTags[key];
						if (value && value !== "*" && !value.includes("|")) {
							expectedValues.add(value);
						}
					}
				}

				// Only yield if there are values
				if (expectedValues.size > 0) {
					yield {
						key,
						expectedValues,
					};
				}
			}
		}

		it("should return tag values that exist in JSON (fields and presets)", async () => {
			const response = await getTagValues("amenity");

			// Collect all amenity values from JSON (fields + presets)
			const expectedValues = new Set<string>();

			// First collect from fields
			const field = fields.amenity;
			if (field?.options && Array.isArray(field.options)) {
				for (const option of field.options) {
					if (typeof option === "string") {
						expectedValues.add(option);
					}
				}
			}

			// Then collect from presets
			for (const preset of Object.values(presets)) {
				if (preset.tags?.amenity) {
					const value = preset.tags.amenity;
					if (value && value !== "*" && !value.includes("|")) {
						expectedValues.add(value);
					}
				}
				if (preset.addTags?.amenity) {
					const value = preset.addTags.amenity;
					if (value && value !== "*" && !value.includes("|")) {
						expectedValues.add(value);
					}
				}
			}

			// Verify all returned values exist in JSON
			for (const value of response.values) {
				assert.ok(
					expectedValues.has(value),
					`Value "${value}" should exist in JSON (fields or presets)`,
				);
			}

			// Verify all JSON values are returned (bidirectional validation)
			const returnedSet = new Set(response.values);
			for (const expected of expectedValues) {
				assert.ok(returnedSet.has(expected), `JSON value "${expected}" should be returned`);
			}
		});

		it("should return correct tag values for multiple keys using provider pattern", async () => {
			// Test each tag key from provider
			for (const testCase of tagKeyProvider()) {
				const response = await getTagValues(testCase.key);
				const returnedSet = new Set(response.values);

				// Bidirectional validation: all returned values should exist in expected
				for (const value of response.values) {
					assert.ok(
						testCase.expectedValues.has(value),
						`Value "${value}" for key "${testCase.key}" should exist in JSON presets`,
					);
				}

				// Bidirectional validation: all expected values should be returned
				for (const expected of testCase.expectedValues) {
					assert.ok(
						returnedSet.has(expected),
						`JSON value "${expected}" for key "${testCase.key}" should be returned`,
					);
				}

				// Exact match validation
				assert.strictEqual(
					returnedSet.size,
					testCase.expectedValues.size,
					`Tag key "${testCase.key}" should return exactly ${testCase.expectedValues.size} values`,
				);
			}
		});

		it("should filter out wildcards and complex patterns from JSON", async () => {
			// Test with a tag that might have wildcards in JSON
			const response = await getTagValues("building");

			// Verify no wildcards or pipe-separated values
			for (const value of response.values) {
				assert.notStrictEqual(value, "*", "Should not include wildcard values");
				assert.ok(!value.includes("|"), `Should not include pipe-separated values: ${value}`);
			}
		});

		it("should validate wildcard filtering across multiple tag keys", async () => {
			// Test multiple keys using provider
			for (const testCase of tagKeyProvider()) {
				const response = await getTagValues(testCase.key);

				// Verify no wildcards or pipe-separated values
				for (const value of response.values) {
					assert.notStrictEqual(
						value,
						"*",
						`Key "${testCase.key}" should not include wildcard values`,
					);
					assert.ok(
						!value.includes("|"),
						`Key "${testCase.key}" should not include pipe-separated values: ${value}`,
					);
				}
			}
		});

		it("should return values from fields.json for keys with field definitions", async () => {
			// Test with "parking" which has comprehensive options in fields.json
			const response = await getTagValues("parking");

			// Get expected values from fields.json
			const parkingField = fields.parking;
			assert.ok(parkingField, "parking field should exist in fields.json");
			assert.ok(parkingField.options, "parking field should have options");

			const expectedOptions = new Set(parkingField.options);

			// Verify ALL field options are included in returned values
			for (const option of parkingField.options) {
				assert.ok(
					response.values.includes(option),
					`Field option "${option}" should be included in returned values. Got: ${response.values.join(", ")}`,
				);
			}

			// Verify we have at least the number of options from fields
			assert.ok(
				response.values.length >= expectedOptions.size,
				`Should return at least ${expectedOptions.size} values (from fields), got ${response.values.length}`,
			);
		});

		it("should return valueName for each value in valuesDetailed", async () => {
			// Test with "parking" which has localized names
			const response = await getTagValues("parking");

			assert.ok(response.valuesDetailed.length > 0, "Should have parking values");

			// Verify that ALL parking values have valueName (NO description in new format)
			for (const item of response.valuesDetailed) {
				assert.ok(
					typeof item.valueName === "string" && item.valueName.length > 0,
					`Parking value "${item.value}" should have a valueName. Got: ${JSON.stringify(item)}`,
				);

				// CRITICAL: NO description field in new format
				assert.ok(
					!("description" in item),
					`Value "${item.value}" should NOT have description field (removed in refactor)`,
				);
			}

			// Verify specific examples from the schema
			const surfaceValue = response.valuesDetailed.find((v) => v.value === "surface");
			assert.ok(surfaceValue, "Should have 'surface' value");
			assert.strictEqual(
				surfaceValue.valueName,
				"Surface",
				"Surface value should have correct valueName",
			);

			const undergroundValue = response.valuesDetailed.find((v) => v.value === "underground");
			assert.ok(undergroundValue, "Should have 'underground' value");
			assert.strictEqual(
				undergroundValue.valueName,
				"Underground",
				"Underground value should have correct valueName",
			);
		});
	});
});
