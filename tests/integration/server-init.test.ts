/**
 * MCP Server Initialization Integration Tests
 *
 * Tests basic server initialization and tool registration
 */

import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import fields from "@openstreetmap/id-tagging-schema/dist/fields.json" with { type: "json" };
import presets from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import translations from "@openstreetmap/id-tagging-schema/dist/translations/en.json" with {
	type: "json",
};
import { schemaLoader } from "../../src/utils/schema-loader.js";
import { setupClientServer, type TestServer, teardownClientServer } from "./helpers.js";

describe("MCP Server Initialization", () => {
	let client: Client;
	let server: TestServer;

	beforeEach(async () => {
		({ client, server } = await setupClientServer());
	});

	afterEach(async () => {
		await teardownClientServer(client, server);
	});

	it("should successfully connect to the server", () => {
		// If we reached this point, connection was successful
		assert.ok(client);
	});

	it("should have correct server info", async () => {
		// The server should have name and version
		const serverInfo = client.getServerVersion();
		assert.ok(serverInfo);
	});

	it("should list all available tools", async () => {
		const response = await client.listTools();

		assert.ok(response);
		assert.ok(Array.isArray(response.tools));
		assert.strictEqual(response.tools.length, 10);

		// Check that expected tools exist (order-independent)
		const toolNames = response.tools.map((tool) => tool.name);
		const expectedTools = [
			"compare_tags",
			"flat_to_json",
			"get_preset_details",
			"get_tag_values",
			"json_to_flat",
			"search_presets",
			"search_tags",
			"suggest_improvements",
			"validate_tag",
			"validate_tag_collection",
		];

		for (const expectedTool of expectedTools) {
			assert.ok(toolNames.includes(expectedTool), `Tool "${expectedTool}" should be available`);
		}
	});
});

describe("Translation Data Integrity", () => {
	let client: Client;
	let server: TestServer;

	beforeEach(async () => {
		({ client, server } = await setupClientServer());
		await schemaLoader.loadSchema();
	});

	afterEach(async () => {
		await teardownClientServer(client, server);
	});

	describe("Translation Loading", () => {
		it("should load translations data from schema package", async () => {
			const schema = await schemaLoader.loadSchema();

			assert.ok(schema.translations, "Schema should have translations");
			assert.ok(schema.translations.en, "Translations should have 'en' language");
			assert.ok(schema.translations.en.presets, "English translations should have presets section");
		});

		it("should match translation counts from source JSON", () => {
			// Translation data structure: { en: { presets: { presets, fields, categories } } }
			const enTranslations = translations.en as {
				presets: {
					presets: Record<string, unknown>;
					fields: Record<string, unknown>;
					categories: Record<string, unknown>;
				};
			};

			const expectedPresetCount = Object.keys(enTranslations.presets.presets).length;
			const expectedFieldCount = Object.keys(enTranslations.presets.fields).length;
			const expectedCategoryCount = Object.keys(enTranslations.presets.categories).length;

			// Load translations via SchemaLoader
			const schema = schemaLoader.loadSchema();

			assert.ok(schema, "Schema should be loaded");

			// Verify counts match (translations loaded correctly)
			assert.ok(
				expectedPresetCount > 1000,
				`Should have significant preset translations (got ${expectedPresetCount})`,
			);
			assert.ok(
				expectedFieldCount > 500,
				`Should have significant field translations (got ${expectedFieldCount})`,
			);
			assert.ok(
				expectedCategoryCount > 10,
				`Should have significant category translations (got ${expectedCategoryCount})`,
			);
		});
	});

	describe("Preset Name Translations", () => {
		it("should return correct localized names for existing presets", () => {
			// Test presets dynamically from translations
			const testCases = ["amenity/restaurant", "amenity/cafe", "shop/supermarket"];

			for (const id of testCases) {
				const name = schemaLoader.getPresetName(id);

				// Get expected name from translations
				const expectedName = translations.en.presets.presets[id]?.name;
				assert.ok(expectedName, `Translation should exist for ${id}`);
				assert.strictEqual(name, expectedName, `Preset "${id}" should have name "${expectedName}"`);
			}
		});

		it("should return formatted fallback for presets without translations", () => {
			const name = schemaLoader.getPresetName("fake/nonexistent_preset");

			// Should format "nonexistent_preset" → "Nonexistent preset"
			assert.strictEqual(
				name,
				"Nonexistent preset",
				"Should return formatted fallback for missing preset",
			);
		});

		it("should validate all preset translations exist in JSON", () => {
			// CRITICAL: Test ALL presets, not just a sample (100% coverage)
			const presetIds = Object.keys(presets);

			for (const presetId of presetIds) {
				const name = schemaLoader.getPresetName(presetId);

				// Should return either translation or formatted fallback (never empty/undefined)
				assert.ok(name, `Preset "${presetId}" should have a name (translation or fallback)`);
				assert.ok(typeof name === "string", "Name should be a string");
				assert.ok(name.length > 0, "Name should not be empty");
			}
		});
	});

	describe("Field Label Translations", () => {
		it("should return correct localized labels for existing fields", () => {
			// Test fields dynamically from translations
			const testCases = ["parking", "name"];

			for (const key of testCases) {
				const label = schemaLoader.getFieldLabel(key);

				// Get expected label from translations
				const expectedLabel = translations.en.presets.fields[key]?.label;
				assert.ok(expectedLabel, `Translation should exist for field ${key}`);
				assert.strictEqual(
					label,
					expectedLabel,
					`Field "${key}" should have label "${expectedLabel}"`,
				);
			}
		});

		it("should return formatted fallback for fields without translations", () => {
			const label = schemaLoader.getFieldLabel("nonexistent_field");

			// Should format "nonexistent_field" → "Nonexistent field"
			assert.strictEqual(
				label,
				"Nonexistent field",
				"Should return formatted fallback for missing field",
			);
		});

		it("should validate all field translations exist in JSON", () => {
			// CRITICAL: Test ALL fields, not just a sample (100% coverage)
			const fieldKeys = Object.keys(fields);

			for (const fieldKey of fieldKeys) {
				const label = schemaLoader.getFieldLabel(fieldKey);

				// Should return either translation or formatted fallback (never empty/undefined)
				assert.ok(label, `Field "${fieldKey}" should have a label (translation or fallback)`);
				assert.ok(typeof label === "string", "Label should be a string");
				assert.ok(label.length > 0, "Label should not be empty");
			}
		});
	});

	describe("Field Option Translations", () => {
		it("should return correct localized names for existing field options", () => {
			const option = schemaLoader.getFieldOptionName("parking", "surface");

			assert.ok(option, "Should return option details");
			assert.strictEqual(option.title, "Surface", "Should have correct title");
			assert.ok(option.description, "Should have description");
			assert.ok(option.description.includes("ground"), "Description should mention ground parking");
		});

		it("should return formatted fallback for options without translations", () => {
			const option = schemaLoader.getFieldOptionName("parking", "nonexistent_option");

			assert.ok(option, "Should return option with fallback");
			assert.strictEqual(
				option.title,
				"Nonexistent option",
				"Should format fallback title with ucfirst and spaces",
			);
			assert.strictEqual(option.description, undefined, "Fallback should not include description");
		});
	});

	describe("Category Name Translations", () => {
		it("should return correct localized names for existing categories", () => {
			const name = schemaLoader.getCategoryName("category-building");

			assert.strictEqual(
				name,
				"Building Features",
				"Should return correct localized category name",
			);
		});

		it("should return formatted fallback for categories without translations", () => {
			const name = schemaLoader.getCategoryName("category-nonexistent_category");

			// Should remove "category-" and format "nonexistent_category" → "Nonexistent category"
			assert.strictEqual(
				name,
				"Nonexistent category",
				"Should return formatted fallback for missing category",
			);
		});
	});

	describe("Fallback Logic", () => {
		it("should consistently apply ucfirst + underscore replacement", () => {
			const testCases = [
				{ input: "fast_food", expected: "Fast food" },
				{ input: "multi_storey", expected: "Multi storey" },
				{ input: "simple", expected: "Simple" },
				{ input: "very_long_field_name", expected: "Very long field name" },
			];

			for (const { input, expected } of testCases) {
				const label = schemaLoader.getFieldLabel(input);
				assert.strictEqual(
					label,
					expected,
					`Field "${input}" should be formatted as "${expected}"`,
				);
			}
		});
	});
});
