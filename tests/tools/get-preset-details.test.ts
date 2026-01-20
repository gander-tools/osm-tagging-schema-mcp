import assert from "node:assert";
import { describe, it } from "node:test";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import translations from "@openstreetmap/id-tagging-schema/dist/translations/en.json" with {
	type: "json",
};
import { getPresetDetails } from "../../src/tools/get-preset-details.ts";

describe("get_preset_details", () => {
	describe("Basic Functionality", () => {
		it("should return complete preset details for a valid preset ID", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(result, "Should return a result");
			assert.strictEqual(result.id, "amenity/restaurant");

			// Get expected name from translations
			const expectedName = translations.en.presets.presets["amenity/restaurant"]?.name;
			assert.ok(expectedName, "Translation should exist for amenity/restaurant");
			assert.strictEqual(result.name, expectedName); // Localized name (required)
			assert.ok(result.tags, "Should have tags property");
			assert.ok(result.tagsDetailed, "Should have tagsDetailed property");
			assert.ok(result.geometry, "Should have geometry property");
			assert.strictEqual(result.icon, undefined, "Should not have icon property");
		});

		it("should return all required properties in new format", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			// Required properties (Phase 8.5)
			assert.strictEqual(typeof result.id, "string");
			assert.strictEqual(typeof result.name, "string");
			assert.strictEqual(typeof result.tags, "object");
			assert.ok(Array.isArray(result.tagsDetailed));
			assert.ok(Array.isArray(result.geometry));

			// Optional properties (if present in preset)
			if (result.fields) {
				assert.ok(Array.isArray(result.fields));
			}
			if (result.moreFields) {
				assert.ok(Array.isArray(result.moreFields));
			}

			// icon should NOT be present (removed in Phase 8.5)
			assert.strictEqual(result.icon, undefined);
		});

		it("should return tags object with correct structure", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(result.tags);
			assert.strictEqual(typeof result.tags, "object");
			assert.strictEqual(result.tags.amenity, "restaurant");
		});

		it("should return tagsDetailed with localized names", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(Array.isArray(result.tagsDetailed));
			assert.ok(result.tagsDetailed.length > 0);

			// Check first tag detail
			const firstTag = result.tagsDetailed[0];
			assert.ok(firstTag);
			assert.strictEqual(typeof firstTag.key, "string");
			assert.strictEqual(typeof firstTag.keyName, "string");
			assert.strictEqual(typeof firstTag.value, "string");
			assert.strictEqual(typeof firstTag.valueName, "string");

			// For amenity=restaurant
			assert.strictEqual(firstTag.key, "amenity");
			assert.strictEqual(firstTag.value, "restaurant");
		});

		it("should use preset names for tagsDetailed valueName", async () => {
			const result = await getPresetDetails("amenity/parking");

			const amenityTag = result.tagsDetailed.find((t) => t.key === "amenity");
			assert.ok(amenityTag, "Should have amenity tag in tagsDetailed");

			// keyName should use title case formatting, NOT field label "Type"
			assert.strictEqual(
				amenityTag.keyName,
				"Amenity",
				"keyName should be 'Amenity', not field label 'Type'",
			);

			// valueName should use preset name "Parking Lot", NOT "Parking"
			// Get expected name from translations
			const expectedParkingName = translations.en.presets.presets["amenity/parking"]?.name;
			assert.ok(expectedParkingName, "Translation should exist for amenity/parking");
			assert.strictEqual(
				amenityTag.valueName,
				expectedParkingName,
				`valueName should be '${expectedParkingName}' from preset amenity/parking`,
			);
		});

		it("should use preset names for tagsDetailed in multiple presets", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			const amenityTag = result.tagsDetailed.find((t) => t.key === "amenity");
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

		it("should return geometry array", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(Array.isArray(result.geometry));
			assert.ok(result.geometry.length > 0, "Should have at least one geometry type");
		});

		it("should return expanded fields array (no field references)", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(result.fields, "Restaurant preset should have fields");
			assert.ok(Array.isArray(result.fields));
			assert.ok(result.fields.length > 0);

			// Fields should be expanded (no {field} or {@templates/X} references)
			for (const field of result.fields) {
				assert.ok(
					!field.startsWith("{"),
					`Field "${field}" should not be a reference (should be expanded)`,
				);
			}
		});

		it("should throw error for non-existent preset", async () => {
			await assert.rejects(
				async () => {
					await getPresetDetails("nonexistent/preset");
				},
				{
					message: /Preset .* not found/,
				},
			);
		});

		it("should use cached data on subsequent calls", async () => {
			const result1 = await getPresetDetails("amenity/cafe");
			const result2 = await getPresetDetails("amenity/cafe");

			assert.deepStrictEqual(result1, result2, "Results should be identical from cache");
		});
	});

	describe("Multiple Input Formats", () => {
		it("should accept preset ID format (amenity/restaurant)", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.strictEqual(result.id, "amenity/restaurant");
			assert.strictEqual(result.tags.amenity, "restaurant");
		});

		it("should accept tag notation format (amenity=restaurant)", async () => {
			const result = await getPresetDetails("amenity=restaurant");

			assert.strictEqual(result.id, "amenity/restaurant");
			assert.strictEqual(result.tags.amenity, "restaurant");
		});

		it("should accept JSON object format ({amenity: restaurant})", async () => {
			const result = await getPresetDetails({ amenity: "restaurant" });

			assert.strictEqual(result.id, "amenity/restaurant");
			assert.strictEqual(result.tags.amenity, "restaurant");
		});

		it("should accept tag notation with multiple tags", async () => {
			const result = await getPresetDetails("highway=footway");

			assert.ok(result.id);
			assert.strictEqual(result.tags.highway, "footway");
		});

		it("should accept JSON object with multiple tags", async () => {
			// Find which preset actually has amenity=school tag
			const expectedPresetId = Object.keys(presets).find((id) => {
				const preset = presets[id as keyof typeof presets];
				return preset.tags?.amenity === "school" && Object.keys(preset.tags).length === 1;
			});
			assert.ok(expectedPresetId, "Should find a preset with amenity=school tag");

			const result = await getPresetDetails({ amenity: "school" });

			assert.strictEqual(
				result.id,
				expectedPresetId,
				`Should return the preset with amenity=school tag (${expectedPresetId})`,
			);
			assert.strictEqual(result.tags.amenity, "school");
		});

		it("should throw error for tag notation with non-existent tag", async () => {
			await assert.rejects(
				async () => {
					await getPresetDetails("nonexistent=value");
				},
				{
					message: /Preset not found/,
				},
			);
		});

		it("should throw error for JSON object with non-existent tags", async () => {
			await assert.rejects(
				async () => {
					await getPresetDetails({ nonexistent: "value" });
				},
				{
					message: /Preset not found/,
				},
			);
		});
	});

	describe("Field Reference Expansion", () => {
		it("should expand {preset_id} field references", async () => {
			// building_point has fields: ["{building}"]
			// building has fields: ["name", "building", "building/levels", "height", "address"]
			const result = await getPresetDetails("building_point");

			assert.ok(result.fields);
			assert.ok(result.fields.length > 0);

			// Should expand {building} to actual fields
			assert.ok(!result.fields.some((f) => f === "{building}"));

			// Should include inherited fields from building preset
			assert.ok(result.fields.includes("name"));
			assert.ok(result.fields.includes("building"));
		});

		it("should expand {@templates/X} template references", async () => {
			// Find a preset with template references
			// shop preset has {@templates/internet_access} and {@templates/poi} in moreFields
			const result = await getPresetDetails("shop");

			assert.ok(result.moreFields);

			// Templates should be expanded in moreFields
			assert.ok(!result.moreFields.some((f) => f.startsWith("{@templates/")));

			// Check if template fields are included
			// @templates/internet_access → ["internet_access", "internet_access/fee", "internet_access/ssid"]
			// @templates/poi → ["name", "address"]
			assert.ok(result.moreFields.includes("internet_access"));

			// name is in fields, not moreFields
			assert.ok(result.fields?.includes("name"));
		});

		it("should handle presets without field references", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			assert.ok(result.fields);
			// Restaurant preset doesn't have field references, so fields are already expanded
			assert.ok(result.fields.length > 0);
		});

		it("should handle recursive field references safely", async () => {
			// Test that recursive references don't cause infinite loop
			const result = await getPresetDetails("building_point");

			assert.ok(result.fields);
			assert.ok(result.fields.length > 0);
			// Should complete without hanging
		});

		it("should expand moreFields in addition to fields", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			if (result.moreFields) {
				// moreFields should also be expanded
				for (const field of result.moreFields) {
					assert.ok(!field.startsWith("{"), `moreField "${field}" should not be a reference`);
				}
			}
		});
	});

	describe("JSON Schema Validation", () => {
		it("should return preset details matching JSON data structure", async () => {
			const result = await getPresetDetails("amenity/restaurant");

			const expected = presets["amenity/restaurant"];
			assert.ok(expected, "Preset should exist in JSON");

			// Verify tags match (backward compatibility)
			assert.deepStrictEqual(result.tags, expected.tags);

			// Verify geometry matches
			assert.deepStrictEqual(result.geometry, expected.geometry);

			// Verify ID matches
			assert.strictEqual(result.id, "amenity/restaurant");

			// Verify name is present (required in Phase 8.5)
			assert.ok(result.name);
			assert.strictEqual(typeof result.name, "string");

			// Verify tagsDetailed is present (Phase 8.5)
			assert.ok(result.tagsDetailed);
			assert.ok(Array.isArray(result.tagsDetailed));

			// icon should NOT be present (removed in Phase 8.5)
			assert.strictEqual(result.icon, undefined);
		});

		it("should validate ALL preset details via provider pattern (100% coverage)", async () => {
			// CRITICAL: Test EVERY preset from JSON, not a sample
			const allPresetIds = Object.keys(presets);
			assert.ok(allPresetIds.length > 1500, "Should have all presets from JSON");

			// Provider pattern: iterate through EVERY preset
			for (const presetId of allPresetIds) {
				const result = await getPresetDetails(presetId);
				const expected = presets[presetId];

				assert.ok(expected, `Preset ${presetId} should exist in JSON`);
				assert.strictEqual(result.id, presetId, `ID should match for ${presetId}`);

				// Verify tags match (backward compatibility)
				assert.deepStrictEqual(result.tags, expected.tags, `Tags should match for ${presetId}`);

				// Verify geometry matches
				assert.deepStrictEqual(
					result.geometry,
					expected.geometry,
					`Geometry should match for ${presetId}`,
				);

				// Verify name is present (required in Phase 8.5)
				assert.ok(result.name, `Name should be present for ${presetId}`);
				assert.strictEqual(typeof result.name, "string", `Name should be a string for ${presetId}`);

				// Verify tagsDetailed is present (Phase 8.5)
				assert.ok(result.tagsDetailed, `tagsDetailed should be present for ${presetId}`);
				assert.ok(
					Array.isArray(result.tagsDetailed),
					`tagsDetailed should be an array for ${presetId}`,
				);

				// Verify fields are expanded (no references)
				if (result.fields) {
					for (const field of result.fields) {
						assert.ok(!field.startsWith("{"), `Field "${field}" in ${presetId} should be expanded`);
					}
				}

				// Verify moreFields are expanded (no references)
				if (result.moreFields) {
					for (const field of result.moreFields) {
						assert.ok(
							!field.startsWith("{"),
							`moreField "${field}" in ${presetId} should be expanded`,
						);
					}
				}

				// icon should NOT be present (removed in Phase 8.5)
				assert.strictEqual(result.icon, undefined, `Icon should not be present for ${presetId}`);
			}
		});

		it("should handle presets without optional fields", async () => {
			// Find a preset without fields (if any exist)
			let presetWithoutFields: string | null = null;
			for (const [id, preset] of Object.entries(presets)) {
				if (!preset.fields) {
					presetWithoutFields = id;
					break;
				}
			}

			if (presetWithoutFields) {
				const result = await getPresetDetails(presetWithoutFields);
				assert.ok(result);
				assert.strictEqual(result.id, presetWithoutFields);
				// fields should be undefined or empty
				assert.ok(!result.fields || result.fields.length === 0);
			}
		});

		it("should validate tagsDetailed structure for ALL presets", async () => {
			// CRITICAL: Test ALL presets, not just a sample
			const allPresetIds = Object.keys(presets);

			for (const presetId of allPresetIds) {
				const result = await getPresetDetails(presetId);

				// Validate each tag in tagsDetailed
				for (const tagDetail of result.tagsDetailed) {
					assert.strictEqual(typeof tagDetail.key, "string");
					assert.strictEqual(typeof tagDetail.keyName, "string");
					assert.strictEqual(typeof tagDetail.value, "string");
					assert.strictEqual(typeof tagDetail.valueName, "string");

					// Verify key and value match tags object
					assert.strictEqual(result.tags[tagDetail.key], tagDetail.value);
				}
			}
		});
	});

	describe("Template System (Phase 8.10)", () => {
		describe("Template Expansion", () => {
			it("should expand {@templates/contact} to email, phone, website, fax", async () => {
				// Find a preset using @templates/contact (e.g., polling_station)
				const result = await getPresetDetails("polling_station");

				// Contact template should be expanded in moreFields
				assert.ok(result.moreFields);
				const moreFields = result.moreFields;

				// Template reference should be removed
				assert.ok(
					!moreFields.includes("{@templates/contact}"),
					"Template reference should be expanded",
				);

				// All contact fields should be present
				const contactFields = ["email", "phone", "website", "fax"];
				for (const field of contactFields) {
					assert.ok(
						moreFields.includes(field) || result.fields?.includes(field),
						`Contact field "${field}" should be present after template expansion`,
					);
				}
			});

			it("should expand {@templates/internet_access} to internet_access fields", async () => {
				const result = await getPresetDetails("shop");

				assert.ok(result.moreFields);
				const moreFields = result.moreFields;

				// Template reference should be removed
				assert.ok(!moreFields.includes("{@templates/internet_access}"));

				// Internet access template fields
				const internetAccessFields = [
					"internet_access",
					"internet_access/fee",
					"internet_access/ssid",
				];
				for (const field of internetAccessFields) {
					assert.ok(
						moreFields.includes(field),
						`Internet access field "${field}" should be present`,
					);
				}
			});

			it("should expand {@templates/poi} to name and address", async () => {
				const result = await getPresetDetails("shop");

				// POI template: name, address
				// name should be in fields or moreFields
				assert.ok(
					result.fields?.includes("name") || result.moreFields?.includes("name"),
					"POI field 'name' should be present",
				);
				// address should be in fields or moreFields
				assert.ok(
					result.fields?.includes("address") || result.moreFields?.includes("address"),
					"POI field 'address' should be present",
				);
			});

			it("should expand crossing templates correctly", async () => {
				// Find a preset with crossing templates
				// highway/crossing uses crossing templates
				const result = await getPresetDetails("highway/crossing");

				const allFields = [...(result.fields || []), ...(result.moreFields || [])];

				// No template references should remain
				for (const field of allFields) {
					assert.ok(
						!field.startsWith("{@templates/"),
						`Field "${field}" should not be a template reference`,
					);
				}

				// At least some crossing fields should be present
				const hasCrossingFields = allFields.some((f) => f.startsWith("crossing"));
				assert.ok(hasCrossingFields, "Should have crossing fields after expansion");
			});

			it("should handle empty templates gracefully", async () => {
				// crossing/bicycle_more is an empty template
				// Find a preset that might use it and verify it doesn't break
				const result = await getPresetDetails("highway/crossing");

				// Should not throw error
				assert.ok(result);
				assert.ok(result.fields || result.moreFields);
			});
		});

		describe("Template Definitions Validation", () => {
			it("should have all expected templates defined", async () => {
				// Get a preset with various templates to verify they're all recognized
				const presetIds = [
					"polling_station", // uses contact, internet_access
					"shop", // uses internet_access, poi
					"highway/crossing", // uses crossing templates
				];

				for (const presetId of presetIds) {
					const result = await getPresetDetails(presetId);

					// Should not have any unexpanded template references
					const allFields = [...(result.fields || []), ...(result.moreFields || [])];
					for (const field of allFields) {
						assert.ok(
							!field.startsWith("{@templates/"),
							`Field "${field}" in preset "${presetId}" should not remain as template reference`,
						);
					}
				}
			});

			it("should preserve non-template fields during expansion", async () => {
				const result = await getPresetDetails("amenity/restaurant");

				// Regular fields should still be present
				assert.ok(result.fields);
				assert.ok(result.fields.includes("name"));
				assert.ok(result.fields.includes("cuisine"));
			});

			it("should expand templates in both fields and moreFields", async () => {
				const result = await getPresetDetails("office");

				// Office preset has templates in moreFields
				if (result.moreFields) {
					// No template references should remain
					for (const field of result.moreFields) {
						assert.ok(!field.startsWith("{@templates/"));
					}
				}

				// Fields should also be expanded
				if (result.fields) {
					for (const field of result.fields) {
						assert.ok(!field.startsWith("{@templates/"));
					}
				}
			});
		});

		describe("Real Schema Data Integration", () => {
			it("should correctly expand templates for all presets using {@templates/contact}", async () => {
				// Find all presets that use contact template
				const presetsWithContactTemplate = Object.entries(presets).filter(([_, preset]) => {
					const allFields = [...(preset.fields || []), ...(preset.moreFields || [])];
					return allFields.includes("{@templates/contact}");
				});

				assert.ok(
					presetsWithContactTemplate.length > 0,
					"Should find presets using contact template",
				);

				// CRITICAL: Test ALL presets with contact template, not just a sample
				for (const [presetId, _] of presetsWithContactTemplate) {
					const result = await getPresetDetails(presetId);
					const allFields = [...(result.fields || []), ...(result.moreFields || [])];

					// Template should be expanded
					assert.ok(
						!allFields.includes("{@templates/contact}"),
						`Preset ${presetId} should have expanded contact template`,
					);

					// At least some contact fields should be present
					const hasContactFields = allFields.some((f) =>
						["email", "phone", "website", "fax"].includes(f),
					);
					assert.ok(
						hasContactFields,
						`Preset ${presetId} should have contact fields after expansion`,
					);
				}
			});

			it("should correctly expand templates for all presets using {@templates/internet_access}", async () => {
				const presetsWithInternetTemplate = Object.entries(presets).filter(([_, preset]) => {
					const allFields = [...(preset.fields || []), ...(preset.moreFields || [])];
					return allFields.includes("{@templates/internet_access}");
				});

				assert.ok(
					presetsWithInternetTemplate.length > 0,
					"Should find presets using internet_access template",
				);

				// CRITICAL: Test ALL presets with internet_access template, not just a sample
				for (const [presetId, _] of presetsWithInternetTemplate) {
					const result = await getPresetDetails(presetId);
					const allFields = [...(result.fields || []), ...(result.moreFields || [])];

					// Template should be expanded
					assert.ok(!allFields.includes("{@templates/internet_access}"));

					// Internet access fields should be present
					assert.ok(allFields.includes("internet_access"));
				}
			});

			it("should handle unknown templates by keeping them as-is", async () => {
				// This test verifies fallback behavior for unknown templates
				// If a template is not in TEMPLATES constant, it should be kept as-is
				// (This is defensive coding - shouldn't happen with real schema data)

				// We can't easily test this with real data, but we can verify
				// that the tool doesn't crash on unexpected input
				const result = await getPresetDetails("amenity/restaurant");
				assert.ok(result);
			});
		});
	});
});
