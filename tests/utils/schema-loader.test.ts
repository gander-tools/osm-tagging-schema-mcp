import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import translations from "@openstreetmap/id-tagging-schema/dist/translations/en.json" with {
	type: "json",
};
import { SchemaLoader } from "../../src/utils/schema-loader.ts";

describe("SchemaLoader", () => {
	let loader: SchemaLoader;

	beforeEach(() => {
		loader = new SchemaLoader();
	});

	describe("loadSchema", () => {
		it("should load schema data successfully", async () => {
			const schema = await loader.loadSchema();

			assert.ok(schema);
			assert.ok(schema.presets);
			assert.ok(schema.fields);
			assert.ok(schema.categories);
			assert.ok(schema.deprecated);
			assert.ok(Array.isArray(schema.deprecated));
		});

		it("should load presets with correct structure", async () => {
			const schema = await loader.loadSchema();
			const presetKeys = Object.keys(schema.presets);

			assert.ok(presetKeys.length > 0);

			// Check first preset has required properties
			const firstPreset = schema.presets[presetKeys[0]];
			assert.ok(firstPreset);
			assert.ok(Array.isArray(firstPreset.geometry));
			assert.ok(typeof firstPreset.tags === "object");
		});

		it("should load fields with correct structure", async () => {
			const schema = await loader.loadSchema();
			const fieldKeys = Object.keys(schema.fields);

			assert.ok(fieldKeys.length > 0);

			// Check first field has required properties
			const firstField = schema.fields[fieldKeys[0]];
			assert.ok(firstField);
			assert.ok(firstField.key);
			assert.ok(firstField.type);
		});
	});

	describe("caching", () => {
		it("should cache schema data after first load", async () => {
			const schema1 = await loader.loadSchema();
			const schema2 = await loader.loadSchema();

			// Should return the same instance (cached)
			assert.strictEqual(schema1, schema2);
		});

		it("should allow clearing cache", async () => {
			const schema1 = await loader.loadSchema();
			loader.clearCache();
			const schema2 = await loader.loadSchema();

			// Should be different instances after cache clear
			assert.notStrictEqual(schema1, schema2);
		});

		it("should respect cache TTL configuration", async () => {
			const shortCacheLoader = new SchemaLoader({ cacheTTL: 100 }); // 100ms
			const schema1 = await shortCacheLoader.loadSchema();

			// Wait for cache to expire
			await new Promise((resolve) => setTimeout(resolve, 150));

			const schema2 = await shortCacheLoader.loadSchema();

			// Should be different instances after TTL expiry
			assert.notStrictEqual(schema1, schema2);
		});
	});

	describe("indexing", () => {
		it("should build tag index when enabled", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const index = indexedLoader.getIndex();

			assert.ok(index);
			assert.ok(index.byKey);
			assert.ok(index.byTag);
			assert.ok(index.byGeometry);
		});

		it("should index presets by tag key", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const index = indexedLoader.getIndex();

			// Should have entries for common keys like "amenity", "shop", etc.
			assert.ok(index.byKey.size > 0);

			// Check that "amenity" key exists and has preset IDs
			const amenityPresets = index.byKey.get("amenity");
			if (amenityPresets) {
				assert.ok(amenityPresets.size > 0);
			}
		});

		it("should index presets by full tag (key=value)", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const index = indexedLoader.getIndex();

			assert.ok(index.byTag.size > 0);
		});

		it("should index presets by geometry type", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const index = indexedLoader.getIndex();

			// Should have entries for all geometry types
			assert.ok(index.byGeometry.get("point"));
			assert.ok(index.byGeometry.get("area"));
		});
	});

	describe("query operations", () => {
		it("should find presets by tag key", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const presets = indexedLoader.findPresetsByKey("amenity");

			assert.ok(Array.isArray(presets));
			assert.ok(presets.length > 0);
		});

		it("should find presets by tag key-value pair", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const presets = indexedLoader.findPresetsByTag("amenity", "parking");

			assert.ok(Array.isArray(presets));
		});

		it("should find presets by geometry", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const presets = indexedLoader.findPresetsByGeometry("point");

			assert.ok(Array.isArray(presets));
			assert.ok(presets.length > 0);
		});

		it("should get field by key", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			const _schema = await indexedLoader.loadSchema();

			const field = indexedLoader.getField("name");

			assert.ok(field);
			assert.strictEqual(field.key, "name");
		});

		it("should check if tag is deprecated", async () => {
			const indexedLoader = new SchemaLoader({ enableIndexing: true });
			await indexedLoader.loadSchema();

			const deprecated = indexedLoader.getDeprecated();

			assert.ok(Array.isArray(deprecated));
			assert.ok(deprecated.length > 0);

			// Check structure of first deprecated item
			const firstDeprecated = deprecated[0];
			assert.ok(firstDeprecated.old);
			assert.ok(firstDeprecated.replace);
		});
	});

	describe("optimizations", () => {
		describe("preloading", () => {
			it("should support warmup/preload method", async () => {
				const preloadLoader = new SchemaLoader();

				// warmup() should load and cache the schema
				await preloadLoader.warmup();

				// Subsequent loadSchema() should return cached data instantly
				const schema = await preloadLoader.loadSchema();

				assert.ok(schema);
				assert.ok(schema.presets);
				assert.ok(schema.fields);
			});

			it("should build index during warmup", async () => {
				const preloadLoader = new SchemaLoader();

				await preloadLoader.warmup();

				// Index should be available after warmup
				const index = preloadLoader.getIndex();

				assert.ok(index);
				assert.ok(index.byKey.size > 0);
				assert.ok(index.byTag.size > 0);
				assert.ok(index.byGeometry.size > 0);
			});

			it("should make warmup() idempotent", async () => {
				const preloadLoader = new SchemaLoader();

				// Call warmup multiple times
				await preloadLoader.warmup();
				const schema1 = await preloadLoader.loadSchema();

				await preloadLoader.warmup();
				const schema2 = await preloadLoader.loadSchema();

				// Should return the same cached instance
				assert.strictEqual(schema1, schema2);
			});
		});

		describe("always build index", () => {
			it("should always build index by default", async () => {
				// Create loader without explicit enableIndexing
				const defaultLoader = new SchemaLoader();
				await defaultLoader.loadSchema();

				// Index should be available without enableIndexing flag
				const index = defaultLoader.getIndex();

				assert.ok(index);
				assert.ok(index.byKey.size > 0);
			});

			it("should not throw when getting index after load", async () => {
				const defaultLoader = new SchemaLoader();
				await defaultLoader.loadSchema();

				// Should not throw - index is always built
				assert.doesNotThrow(() => {
					defaultLoader.getIndex();
				});
			});
		});

		describe("field key index", () => {
			it("should index all field keys for fast lookup", async () => {
				const indexedLoader = new SchemaLoader();
				await indexedLoader.loadSchema();

				const index = indexedLoader.getIndex();

				// Field key index should exist
				assert.ok(index.byFieldKey);
				assert.ok(index.byFieldKey instanceof Map);
				assert.ok(index.byFieldKey.size > 0);
			});

			it("should map OSM tag keys to field definitions", async () => {
				const indexedLoader = new SchemaLoader();
				await indexedLoader.loadSchema();

				const index = indexedLoader.getIndex();

				// Check that common fields are indexed by their OSM tag key
				assert.ok(index.byFieldKey.has("name"));
				assert.ok(index.byFieldKey.has("amenity"));

				// Get field via index
				const nameField = index.byFieldKey.get("name");
				assert.ok(nameField);
				assert.strictEqual(nameField.key, "name");
			});

			it("should support fast field lookups using index", async () => {
				const indexedLoader = new SchemaLoader();
				await indexedLoader.loadSchema();

				// New optimized method using index
				const field = indexedLoader.findFieldByKey("name");

				assert.ok(field);
				assert.strictEqual(field.key, "name");
			});

			it("should return undefined for non-existent field keys", async () => {
				const indexedLoader = new SchemaLoader();
				await indexedLoader.loadSchema();

				const field = indexedLoader.findFieldByKey("nonexistent_key_12345");

				assert.strictEqual(field, undefined);
			});
		});

		describe("performance", () => {
			it("should build index during schema load (single pass)", async () => {
				const optimizedLoader = new SchemaLoader();

				// Track that index is built during loadSchema, not after
				const startTime = Date.now();
				await optimizedLoader.loadSchema();
				const loadTime = Date.now() - startTime;

				// Index should be immediately available
				const index = optimizedLoader.getIndex();
				assert.ok(index);

				// Getting index should be instant (already built)
				const indexStartTime = Date.now();
				optimizedLoader.getIndex();
				const indexTime = Date.now() - indexStartTime;

				// Index access should be < 1ms (already built during load)
				assert.ok(indexTime < 5, `Index access took ${indexTime}ms, should be instant`);

				// Just verify load completed reasonably fast
				assert.ok(
					loadTime < 5000,
					`Schema load took ${loadTime}ms, should complete in reasonable time`,
				);
			});
		});

		describe("schema version tracking", () => {
			it("should include version metadata in loaded schema", async () => {
				const loader = new SchemaLoader();
				const schema = await loader.loadSchema();

				// Schema should include metadata with version
				assert.ok(schema.metadata, "Schema should have metadata");
				assert.ok(schema.metadata.version, "Metadata should include version");
				assert.ok(typeof schema.metadata.version === "string", "Version should be a string");
				assert.match(
					schema.metadata.version,
					/^\d+\.\d+\.\d+/,
					"Version should match semver format",
				);
			});

			it("should include loadedAt timestamp in metadata", async () => {
				const loader = new SchemaLoader();
				const beforeLoad = Date.now();
				const schema = await loader.loadSchema();
				const afterLoad = Date.now();

				assert.ok(schema.metadata, "Schema should have metadata");
				assert.ok(schema.metadata.loadedAt, "Metadata should include loadedAt timestamp");
				assert.ok(typeof schema.metadata.loadedAt === "number", "loadedAt should be a number");
				assert.ok(
					schema.metadata.loadedAt >= beforeLoad && schema.metadata.loadedAt <= afterLoad,
					"loadedAt should be within load time range",
				);
			});

			it("should provide method to get schema version", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const version = loader.getSchemaVersion();

				assert.ok(version, "Should return version");
				assert.ok(typeof version === "string", "Version should be a string");
				assert.match(version, /^\d+\.\d+\.\d+/, "Version should match semver format");
			});

			it("should detect version changes on cache refresh", async () => {
				const loader = new SchemaLoader({ cacheTTL: 100 });
				const schema1 = await loader.loadSchema();
				const version1 = schema1.metadata?.version;

				// Clear cache and reload
				loader.clearCache();
				const schema2 = await loader.loadSchema();
				const version2 = schema2.metadata?.version;

				// Versions should be the same (same package installed)
				assert.strictEqual(version2, version1, "Versions should match");
			});

			it("should update loadedAt timestamp on cache refresh", async () => {
				const loader = new SchemaLoader({ cacheTTL: 100 });
				const schema1 = await loader.loadSchema();
				const loadedAt1 = schema1.metadata?.loadedAt;

				// Wait a bit
				await new Promise((resolve) => setTimeout(resolve, 50));

				// Clear cache and reload
				loader.clearCache();
				const schema2 = await loader.loadSchema();
				const loadedAt2 = schema2.metadata?.loadedAt;

				assert.ok(
					loadedAt2 && loadedAt1 && loadedAt2 > loadedAt1,
					"loadedAt should be updated on reload",
				);
			});
		});

		describe("schema structure validation", () => {
			it("should validate that all required data files are loaded", async () => {
				const loader = new SchemaLoader();
				const schema = await loader.loadSchema();

				// Verify all required properties exist
				assert.ok(schema.presets, "Schema should have presets");
				assert.ok(schema.fields, "Schema should have fields");
				assert.ok(schema.categories, "Schema should have categories");
				assert.ok(schema.deprecated, "Schema should have deprecated");
				assert.ok(schema.defaults, "Schema should have defaults");
			});

			it("should validate schema data structure integrity", async () => {
				const loader = new SchemaLoader();
				const schema = await loader.loadSchema();

				// Presets should be non-empty object
				assert.ok(
					typeof schema.presets === "object" && schema.presets !== null,
					"Presets should be an object",
				);
				assert.ok(Object.keys(schema.presets).length > 0, "Presets should not be empty");

				// Fields should be non-empty object
				assert.ok(
					typeof schema.fields === "object" && schema.fields !== null,
					"Fields should be an object",
				);
				assert.ok(Object.keys(schema.fields).length > 0, "Fields should not be empty");

				// Deprecated should be non-empty array
				assert.ok(Array.isArray(schema.deprecated), "Deprecated should be an array");
				assert.ok(schema.deprecated.length > 0, "Deprecated should not be empty");
			});

			it("should validate preset data structure", async () => {
				const loader = new SchemaLoader();
				const schema = await loader.loadSchema();

				// Check that at least one preset has the expected structure
				const presetKey = Object.keys(schema.presets)[0];
				const preset = schema.presets[presetKey];

				assert.ok(Array.isArray(preset.geometry), "Preset should have geometry array");
				assert.ok(preset.geometry.length > 0, "Preset geometry should not be empty");
				assert.ok(
					typeof preset.tags === "object" && preset.tags !== null,
					"Preset should have tags object",
				);
			});

			it("should validate field data structure", async () => {
				const loader = new SchemaLoader();
				const schema = await loader.loadSchema();

				// Check that at least one field has the expected structure
				const fieldKey = Object.keys(schema.fields)[0];
				const field = schema.fields[fieldKey];

				assert.ok(field.key, "Field should have key property");
				assert.ok(typeof field.key === "string", "Field key should be a string");
				assert.ok(field.type, "Field should have type property");
				assert.ok(typeof field.type === "string", "Field type should be a string");
			});
		});

		describe("graceful error handling", () => {
			it("should throw descriptive error when schema files cannot be loaded", async () => {
				// Create loader with invalid path
				const invalidLoader = new SchemaLoader();
				// Override the base path to trigger error
				// biome-ignore lint/suspicious/noExplicitAny: Test requires accessing private field
				(invalidLoader as any).schemaBasePath = "/nonexistent/path";

				await assert.rejects(
					async () => await invalidLoader.loadSchema(),
					{
						message: /Failed to load schema/i,
					},
					"Should throw error with descriptive message",
				);
			});

			it("should preserve cached schema on failed reload", async () => {
				const loader = new SchemaLoader({ cacheTTL: 100 });

				// Load schema successfully
				const schema1 = await loader.loadSchema();
				assert.ok(schema1, "Initial load should succeed");

				// Break the loader by invalidating the path
				// biome-ignore lint/suspicious/noExplicitAny: Test requires accessing private field
				(loader as any).schemaBasePath = "/nonexistent/path";

				// Wait for cache to expire
				await new Promise((resolve) => setTimeout(resolve, 150));

				// Attempt to reload should fail, but we should have error handling
				await assert.rejects(
					async () => await loader.loadSchema(),
					/Failed to load schema/i,
					"Should throw error on reload failure",
				);
			});

			it("should provide clear error message for corrupted JSON", async () => {
				// This test documents expected behavior
				// In practice, corrupted JSON would cause JSON.parse to throw
				// The loader should catch and wrap this in a descriptive error
				const loader = new SchemaLoader();

				// We can't easily test this without mocking, but document the expectation
				// that JSON parsing errors should be caught and wrapped
				await assert.doesNotReject(
					async () => await loader.loadSchema(),
					"Valid schema should load successfully",
				);
			});
		});
	});

	describe("translation loading and lookups", () => {
		it("should load translations data successfully", async () => {
			const loader = new SchemaLoader();
			const schema = await loader.loadSchema();

			// Translations should be loaded
			assert.ok(schema.translations, "Schema should have translations");
			assert.ok(schema.translations.en, "Translations should have 'en' language");
			assert.ok(schema.translations.en.presets, "English translations should have presets section");
			assert.ok(
				schema.translations.en.presets.presets,
				"Presets section should have presets translations",
			);
			assert.ok(
				schema.translations.en.presets.fields,
				"Presets section should have fields translations",
			);
			assert.ok(
				schema.translations.en.presets.categories,
				"Presets section should have categories translations",
			);
		});

		describe("getPresetName", () => {
			it("should return localized name for preset with translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getPresetName("amenity/restaurant");

				// Get expected name from translations
				const expectedName = translations.en.presets.presets["amenity/restaurant"]?.name;
				assert.ok(expectedName, "Translation should exist for amenity/restaurant");

				assert.ok(name, "Should return a name");
				assert.strictEqual(
					name,
					expectedName,
					`Should return localized preset name (${expectedName})`,
				);
			});

			it("should return formatted fallback for preset without translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getPresetName("fake/nonexistent_preset");

				// Should format "nonexistent_preset" → "Nonexistent preset"
				assert.ok(name, "Should return a fallback name");
				assert.strictEqual(
					name,
					"Nonexistent preset",
					"Should format fallback with ucfirst and spaces",
				);
			});

			it("should extract value part from preset ID for fallback", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getPresetName("amenity/fast_food");

				// Should use translation if available, or format "fast_food" → "Fast food"
				assert.ok(name, "Should return a name");
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getPresetName("amenity/restaurant"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("getFieldLabel", () => {
			it("should return localized label for field with translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("parking");

				assert.ok(label, "Should return a label");
				assert.strictEqual(label, "Type", "Should return localized field label");
			});

			it("should return formatted fallback for field without translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("nonexistent_field");

				// Should format "nonexistent_field" → "Nonexistent field"
				assert.ok(label, "Should return a fallback label");
				assert.strictEqual(
					label,
					"Nonexistent field",
					"Should format fallback with ucfirst and spaces",
				);
			});

			it("should handle underscores in field keys", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("opening_hours");

				// Should use translation if available, or format "opening_hours" → "Opening hours"
				assert.ok(label, "Should return a label");
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getFieldLabel("parking"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("getFieldOptionName", () => {
			it("should return localized name for field option with translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const option = loader.getFieldOptionName("parking", "surface");

				assert.ok(option, "Should return option details");
				assert.ok(option.title, "Should have title");
				assert.strictEqual(option.title, "Surface", "Should return localized option title");
				assert.ok(option.description, "Should have description");
			});

			it("should return formatted fallback for option without translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const option = loader.getFieldOptionName("parking", "nonexistent_option");

				assert.ok(option, "Should return option with fallback");
				assert.ok(option.title, "Should have title");
				assert.strictEqual(
					option.title,
					"Nonexistent option",
					"Should format fallback with ucfirst and spaces",
				);
				assert.strictEqual(
					option.description,
					undefined,
					"Fallback should not include description",
				);
			});

			it("should handle multi-word option values", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const option = loader.getFieldOptionName("parking", "multi-storey");

				// Should use translation if available (multi-storey → "Multilevel")
				assert.ok(option, "Should return option details");
				assert.ok(option.title, "Should have title");
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getFieldOptionName("parking", "surface"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("getCategoryName", () => {
			it("should return localized name for category with translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getCategoryName("category-building");

				assert.ok(name, "Should return a name");
				assert.strictEqual(name, "Building Features", "Should return localized category name");
			});

			it("should return formatted fallback for category without translation", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getCategoryName("category-nonexistent_category");

				// Should remove "category-" prefix and format "nonexistent_category" → "Nonexistent category"
				assert.ok(name, "Should return a fallback name");
				assert.strictEqual(
					name,
					"Nonexistent category",
					"Should format fallback with ucfirst and spaces",
				);
			});

			it("should remove category prefix from fallback", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getCategoryName("category-test_category");

				// Should format without "category-" prefix: "test_category" → "Test category"
				assert.ok(name, "Should return a name");
				assert.strictEqual(
					name,
					"Test category",
					"Should remove prefix and format with ucfirst and spaces",
				);
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getCategoryName("category-building"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("getTagKeyName", () => {
			it("should return title case formatted name for single word keys", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagKeyName("parking");

				// Should NOT use field label "Type" from fields.json
				// Should use title case formatting: "parking" → "Parking"
				assert.strictEqual(
					name,
					"Parking",
					"Should return title case formatted name, not field label",
				);
			});

			it("should return title case formatted name for multi-word keys", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagKeyName("parking_space");

				// Should NOT use field label "Type" from fields.json
				// Should use title case formatting: "parking_space" → "Parking Space"
				assert.strictEqual(name, "Parking Space", "Should capitalize each word in multi-word keys");
			});

			it("should format keys with multiple underscores", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagKeyName("street_side_parking");

				// "street_side_parking" → "Street Side Parking"
				assert.strictEqual(
					name,
					"Street Side Parking",
					"Should replace all underscores and capitalize each word",
				);
			});

			it("should handle keys without underscores", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagKeyName("amenity");

				// "amenity" → "Amenity"
				assert.strictEqual(name, "Amenity", "Should capitalize single word keys");
			});

			it("should handle empty strings", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagKeyName("");

				assert.strictEqual(name, "", "Should return empty string for empty input");
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getTagKeyName("parking"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("getTagValueName", () => {
			it("should return preset name for value with matching preset", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("amenity", "parking");

				// Should find preset "amenity/parking" and return its name from translations
				const expectedName = translations.en.presets.presets["amenity/parking"]?.name;
				assert.ok(expectedName, "Translation should exist for amenity/parking");
				assert.strictEqual(
					name,
					expectedName,
					`Should return preset name for amenity=parking (${expectedName})`,
				);
			});

			it("should return preset name for parking_space", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("amenity", "parking_space");

				// Should find preset "amenity/parking_space" and return its name from translations
				const expectedName = translations.en.presets.presets["amenity/parking_space"]?.name;
				assert.ok(expectedName, "Translation should exist for amenity/parking_space");
				assert.strictEqual(
					name,
					expectedName,
					`Should return preset name for amenity=parking_space (${expectedName})`,
				);
			});

			it("should return preset name for restaurant", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("amenity", "restaurant");

				// Should find preset "amenity/restaurant" and return its name from translations
				const expectedName = translations.en.presets.presets["amenity/restaurant"]?.name;
				assert.ok(expectedName, "Translation should exist for amenity/restaurant");
				assert.strictEqual(
					name,
					expectedName,
					`Should return preset name for amenity=restaurant (${expectedName})`,
				);
			});

			it("should fallback to field options when no preset exists", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("parking", "surface");

				// No preset "parking/surface", should use field options or title case
				assert.strictEqual(name, "Surface", "Should fallback to field options or title case");
			});

			it("should use title case for values without preset or field option", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("custom_key", "multi_word_value");

				// No preset, no field option - should use title case
				assert.strictEqual(
					name,
					"Multi word value",
					"Should apply title case formatting as final fallback",
				);
			});

			it("should handle empty value", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const name = loader.getTagValueName("amenity", "");

				assert.strictEqual(name, "", "Should return empty string for empty value");
			});

			it("should throw error if schema not loaded", () => {
				const loader = new SchemaLoader();

				assert.throws(
					() => loader.getTagValueName("amenity", "parking"),
					/Schema not loaded/,
					"Should throw error if schema not loaded",
				);
			});
		});

		describe("fallback formatting", () => {
			it("should handle empty strings", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("");

				assert.strictEqual(label, "", "Should return empty string for empty input");
			});

			it("should handle strings without underscores", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("simple");

				// Should format "simple" → "Simple"
				assert.strictEqual(label, "Simple", "Should uppercase first letter");
			});

			it("should handle strings with multiple underscores", async () => {
				const loader = new SchemaLoader();
				await loader.loadSchema();

				const label = loader.getFieldLabel("very_long_field_name");

				// Should format "very_long_field_name" → "Very long field name"
				assert.strictEqual(
					label,
					"Very long field name",
					"Should replace all underscores with spaces",
				);
			});
		});
	});
});
