import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toolsMetadata } from "../../src/metadata.js";
import { tools } from "../../src/tools/index.js";

/**
 * Tests for tool descriptions quality
 *
 * Requirements:
 * - Descriptions should be detailed and informative (not brief like "Keyword to search for")
 * - Descriptions should include concrete examples
 * - Descriptions should explain use cases
 * - Input parameter descriptions should be detailed with examples
 */

describe("Tool Descriptions Quality", () => {
	describe("Tool description length and detail", () => {
		it("should have substantial descriptions (minimum 200 characters)", () => {
			for (const tool of tools) {
				const config = tool.config();
				const descLength = config.description.length;

				assert.ok(
					descLength >= 200,
					`Tool '${tool.name}' description is too brief (${descLength} chars). Expected at least 200 chars for detailed description.`,
				);
			}
		});

		it("should include use cases or benefits in description", () => {
			const useCaseIndicators = [
				"use this",
				"use case",
				"use when",
				"essential for",
				"helps",
				"enables",
				"allows",
			];

			for (const tool of tools) {
				const config = tool.config();
				const desc = config.description.toLowerCase();

				const hasUseCase = useCaseIndicators.some((indicator) => desc.includes(indicator));

				assert.ok(
					hasUseCase,
					`Tool '${tool.name}' description should explain use cases or benefits`,
				);
			}
		});
	});

	describe("Input parameter descriptions", () => {
		it("should have detailed parameter descriptions (minimum 50 characters)", () => {
			for (const tool of tools) {
				const config = tool.config();

				for (const [paramName, paramSchema] of Object.entries(config.inputSchema)) {
					// Get description from Zod schema
					const description = (paramSchema as { description?: string }).description || "";
					const descLength = description.length;

					assert.ok(
						descLength >= 50,
						`Tool '${tool.name}' parameter '${paramName}' description is too brief (${descLength} chars). Expected at least 50 chars.`,
					);
				}
			}
		});

		it("should include examples in parameter descriptions", () => {
			const exampleIndicators = [
				"e.g.",
				"example:",
				"examples:",
				"for example",
				"such as",
				"like",
				"(", // Examples often in parentheses
			];

			for (const tool of tools) {
				const config = tool.config();

				for (const [paramName, paramSchema] of Object.entries(config.inputSchema)) {
					const description = (paramSchema as { description?: string }).description || "";
					const descLower = description.toLowerCase();

					const hasExample = exampleIndicators.some((indicator) => descLower.includes(indicator));

					// Skip optional parameters without examples (like limit)
					const isOptional =
						(paramSchema as { isOptional?: () => boolean }).isOptional?.() || false;

					if (!isOptional) {
						assert.ok(
							hasExample,
							`Tool '${tool.name}' parameter '${paramName}' should include examples`,
						);
					}
				}
			}
		});
	});

	describe("Specific tool improvements", () => {
		it("search_tags should clarify single keyword vs tag pair", () => {
			const searchTags = tools.find((t) => t.name === "search_tags");
			assert.ok(searchTags, "search_tags tool should exist");

			const config = searchTags.config();
			const keywordDesc = (config.inputSchema.keyword as { description: string }).description;

			assert.ok(
				keywordDesc.includes("standalone") || keywordDesc.includes("single"),
				"search_tags keyword parameter should clarify it's a standalone word, not a tag pair",
			);

			assert.ok(
				keywordDesc.includes("search_presets"),
				"search_tags keyword parameter should mention search_presets for tag pairs",
			);
		});

		it("validate_tag should explain comprehensive validation checks", () => {
			const validateTag = tools.find((t) => t.name === "validate_tag");
			assert.ok(validateTag, "validate_tag tool should exist");

			const config = validateTag.config();
			const desc = config.description.toLowerCase();

			const checks = ["deprecation", "schema", "option", "field"];

			for (const check of checks) {
				assert.ok(desc.includes(check), `validate_tag should mention '${check}' validation`);
			}
		});

		it("flat_to_json should be labeled as INPUT CONVERTER", () => {
			const flatToJson = tools.find((t) => t.name === "flat_to_json");
			assert.ok(flatToJson, "flat_to_json tool should exist");

			const config = flatToJson.config();

			assert.ok(
				config.description.includes("INPUT CONVERTER"),
				"flat_to_json should be labeled as INPUT CONVERTER",
			);

			assert.ok(
				config.description.includes("FIRST"),
				"flat_to_json should explain it's used FIRST in workflow",
			);
		});

		it("json_to_flat should be labeled as OUTPUT CONVERTER", () => {
			const jsonToFlat = tools.find((t) => t.name === "json_to_flat");
			assert.ok(jsonToFlat, "json_to_flat tool should exist");

			const config = jsonToFlat.config();

			assert.ok(
				config.description.includes("OUTPUT CONVERTER"),
				"json_to_flat should be labeled as OUTPUT CONVERTER",
			);

			assert.ok(
				config.description.includes("LAST"),
				"json_to_flat should explain it's used LAST in workflow",
			);
		});

		it("search_presets should explain preset concept", () => {
			const searchPresets = tools.find((t) => t.name === "search_presets");
			assert.ok(searchPresets, "search_presets tool should exist");

			const config = searchPresets.config();
			const desc = config.description.toLowerCase();

			assert.ok(desc.includes("preset"), "search_presets should explain what presets are");

			assert.ok(
				desc.includes("template") || desc.includes("feature type"),
				"search_presets should explain presets as templates or feature types",
			);
		});
	});

	describe("Consistency across tools", () => {
		it("tools accepting tag collections should mention all three input formats", () => {
			const collectionTools = tools.filter((t) =>
				["validate_tag_collection", "suggest_improvements"].includes(t.name),
			);

			for (const tool of collectionTools) {
				const config = tool.config();
				const tagsDesc = (config.inputSchema.tags as { description: string }).description;

				assert.ok(
					tagsDesc.includes("JSON object") || tagsDesc.includes("object"),
					`${tool.name} should mention JSON object format`,
				);

				assert.ok(
					tagsDesc.includes("JSON string") || tagsDesc.includes("string"),
					`${tool.name} should mention JSON string format`,
				);

				assert.ok(
					tagsDesc.includes("flat") ||
						tagsDesc.includes("text format") ||
						tagsDesc.includes("key=value"),
					`${tool.name} should mention flat text format`,
				);
			}
		});

		it("geometry parameters should explain OSM geometry types", () => {
			const geometryTools = tools.filter((t) => "geometry" in t.config().inputSchema);

			for (const tool of geometryTools) {
				const config = tool.config();
				const geometryDesc = (config.inputSchema.geometry as { description: string }).description;

				const geometryTypes = ["point", "line", "area"];

				for (const type of geometryTypes) {
					assert.ok(
						geometryDesc.includes(type),
						`${tool.name} geometry parameter should explain '${type}' type`,
					);
				}
			}
		});
	});

	describe("Tool Metadata Fields (MCP SDK 1.25)", () => {
		it("every tool should have a name field in config()", () => {
			for (const tool of tools) {
				const config = tool.config();
				const metadata = toolsMetadata[tool.name];

				assert.ok(metadata, `Tool '${tool.name}' should have metadata defined`);
				assert.ok(metadata.name, `Tool '${tool.name}' should have name in metadata`);
				assert.ok(config.name, `Tool '${tool.name}' config() should return a name field`);
				assert.strictEqual(
					config.name,
					tool.name,
					`Tool '${tool.name}' config().name should match tool.name`,
				);
				assert.strictEqual(
					config.name,
					metadata.name,
					`Tool '${tool.name}' config().name should match metadata.name`,
				);
			}
		});

		it("every tool should have a title field in config()", () => {
			for (const tool of tools) {
				const config = tool.config();
				const metadata = toolsMetadata[tool.name];

				assert.ok(metadata, `Tool '${tool.name}' should have metadata defined`);
				assert.ok(metadata.title, `Tool '${tool.name}' should have title in metadata`);
				assert.ok(config.title, `Tool '${tool.name}' config() should return a title field`);
				assert.strictEqual(
					config.title,
					metadata.title,
					`Tool '${tool.name}' config().title should match metadata.title`,
				);
			}
		});

		it("every tool should have consistent title in config and metadata", () => {
			for (const tool of tools) {
				const config = tool.config();
				const metadata = toolsMetadata[tool.name];

				assert.ok(metadata, `Tool '${tool.name}' should have metadata defined`);
				assert.strictEqual(
					config.title,
					metadata.title,
					`Tool '${tool.name}': config.title should equal metadata.title`,
				);
			}
		});

		it("all tools should have title defined in toolsMetadata", () => {
			// Verify ALL tools have metadata and title defined (100% coverage)
			const toolNames = tools.map((t) => t.name);
			const metadataNames = Object.keys(toolsMetadata);

			for (const toolName of toolNames) {
				assert.ok(
					metadataNames.includes(toolName),
					`Tool '${toolName}' should have entry in toolsMetadata`,
				);

				const metadata = toolsMetadata[toolName];
				assert.ok(metadata.title, `Tool '${toolName}' should have title in toolsMetadata`);
				assert.ok(
					typeof metadata.title === "string" && metadata.title.length > 0,
					`Tool '${toolName}' title should be a non-empty string`,
				);
			}
		});
	});
});
