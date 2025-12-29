import { z } from "zod";
import { getToolMetadata } from "../metadata.js";
import type { OsmToolDefinition } from "../types/index.js";
import { schemaLoader } from "../utils/schema-loader.js";
import { limitOption } from "./common-options.js";
import { getTagValues } from "./get-tag-values.js";
import type { KeyMatch, SearchTagsResponse, ValueMatch } from "./types.js";

/**
 * Search for tags by keyword (Phase 8.4 refactored version)
 *
 * @param keyword - Keyword to search for in tag keys and values
 * @param limit - Maximum number of results to return (optional, default: 100)
 * @returns Response object with keyMatches and valueMatches
 */
export async function searchTags(keyword: string, limit?: number): Promise<SearchTagsResponse> {
	const schema = await schemaLoader.loadSchema();
	const keyMatches: KeyMatch[] = [];
	const valueMatches: ValueMatch[] = [];
	const seenKeys = new Set<string>(); // Track keys we've already added to keyMatches
	const seenValuePairs = new Set<string>(); // Track key=value pairs we've added to valueMatches

	// Normalize keyword for case-insensitive search
	const normalizedKeyword = keyword.toLowerCase();

	// Apply limit (default: 100)
	const effectiveLimit = limit ?? 100;
	let totalResults = 0;

	// Helper function to check if we've hit the limit
	const hitLimit = (): boolean => {
		totalResults = keyMatches.length + valueMatches.length;
		return totalResults >= effectiveLimit;
	};

	// FIRST: Search through fields for matching tag keys
	// This finds keys like "wheelchair" that exist in fields.json
	// Field map keys are FILE PATHS (e.g., "toilets/wheelchair" → data/fields/toilets/wheelchair.json)
	// The actual OSM tag is in field.key property (e.g., "toilets:wheelchair")
	for (const [_fieldKey, field] of Object.entries(schema.fields)) {
		// Use the actual OSM tag key from field.key (with colon separator)
		if (!field.key) continue;

		const actualKey = field.key; // This is the real OSM tag (e.g., "parking:both")

		// Check if key matches the keyword
		if (actualKey.toLowerCase().includes(normalizedKeyword)) {
			// Key match: Get ALL values for this key
			if (!seenKeys.has(actualKey)) {
				seenKeys.add(actualKey);

				// Use getTagValues to get all values for this key (with translations)
				const tagValuesResponse = await getTagValues(actualKey);

				keyMatches.push({
					key: tagValuesResponse.key,
					keyName: tagValuesResponse.keyName,
					values: tagValuesResponse.values,
					valuesDetailed: tagValuesResponse.valuesDetailed,
				});

				if (hitLimit()) {
					return { keyMatches, valueMatches };
				}
			}
		}
	}

	// SECOND: Search through all presets for matching keys and values
	for (const preset of Object.values(schema.presets)) {
		// Search in preset.tags
		for (const [key, value] of Object.entries(preset.tags)) {
			const keyMatch = key.toLowerCase().includes(normalizedKeyword);
			const valueMatch =
				typeof value === "string" && value.toLowerCase().includes(normalizedKeyword);

			// Skip wildcards and complex patterns
			if (!value || value === "*" || value.includes("|")) {
				continue;
			}

			// KEY MATCH: Return ALL values for this key
			if (keyMatch && !seenKeys.has(key)) {
				seenKeys.add(key);

				// Use getTagValues to get all values for this key (with translations)
				const tagValuesResponse = await getTagValues(key);

				keyMatches.push({
					key: tagValuesResponse.key,
					keyName: tagValuesResponse.keyName,
					values: tagValuesResponse.values,
					valuesDetailed: tagValuesResponse.valuesDetailed,
				});

				if (hitLimit()) {
					return { keyMatches, valueMatches };
				}
			}

			// VALUE MATCH: Return specific key-value pair
			if (valueMatch && typeof value === "string") {
				const pairId = `${key}=${value}`;
				if (!seenValuePairs.has(pairId)) {
					seenValuePairs.add(pairId);

					// Get field key for translation lookup
					const fieldKey = key.replace(/:/g, "/");

					// Get localized names using schema loader's translation utilities
					const keyName = schemaLoader.getFieldLabel(fieldKey);
					const { title: valueName } = schemaLoader.getFieldOptionName(fieldKey, value);

					valueMatches.push({
						key,
						keyName,
						value,
						valueName,
					});

					if (hitLimit()) {
						return { keyMatches, valueMatches };
					}
				}
			}
		}

		// Also check addTags
		if (preset.addTags) {
			for (const [key, value] of Object.entries(preset.addTags)) {
				const keyMatch = key.toLowerCase().includes(normalizedKeyword);
				const valueMatch =
					typeof value === "string" && value.toLowerCase().includes(normalizedKeyword);

				if (!value || value === "*" || value.includes("|")) {
					continue;
				}

				// KEY MATCH
				if (keyMatch && !seenKeys.has(key)) {
					seenKeys.add(key);

					const tagValuesResponse = await getTagValues(key);

					keyMatches.push({
						key: tagValuesResponse.key,
						keyName: tagValuesResponse.keyName,
						values: tagValuesResponse.values,
						valuesDetailed: tagValuesResponse.valuesDetailed,
					});

					if (hitLimit()) {
						return { keyMatches, valueMatches };
					}
				}

				// VALUE MATCH
				if (valueMatch && typeof value === "string") {
					const pairId = `${key}=${value}`;
					if (!seenValuePairs.has(pairId)) {
						seenValuePairs.add(pairId);

						const fieldKey = key.replace(/:/g, "/");
						const keyName = schemaLoader.getFieldLabel(fieldKey);
						const { title: valueName } = schemaLoader.getFieldOptionName(fieldKey, value);

						valueMatches.push({
							key,
							keyName,
							value,
							valueName,
						});

						if (hitLimit()) {
							return { keyMatches, valueMatches };
						}
					}
				}
			}
		}
	}

	return { keyMatches, valueMatches };
}

/**
 * Tool definition for search_tags following new OsmToolDefinition interface
 *
 * Search for tags by keyword in tag keys and values.
 * Phase 8.4 refactored version with separate keyMatches and valueMatches.
 */
const SearchTags: OsmToolDefinition<{
	keyword: z.ZodString;
	limit: z.ZodOptional<z.ZodNumber>;
	options: z.ZodOptional<
		z.ZodObject<{
			limit: z.ZodOptional<z.ZodNumber>;
		}>
	>;
}> = {
	name: "search_tags" as const,

	config: () => {
		const metadata = getToolMetadata("search_tags");
		if (!metadata) {
			throw new Error("Tool metadata not found for search_tags");
		}

		return {
			description: metadata.description,
			inputSchema: {
				keyword: z.string().describe(metadata.parameters.keyword!.description),
				limit: z
					.number()
					.optional()
					.describe(
						"(Deprecated: use options.limit instead) Maximum total number of results to return across both keyMatches and valueMatches combined (default: 100). Use lower values for faster responses when you only need a few results.",
					),
				options: z
					.object({
						limit: limitOption,
					})
					.optional()
					.describe(metadata.parameters.options!.description),
			},
		};
	},

	handler: async ({ keyword, limit, options }, _extra) => {
		// Support both old 'limit' parameter and new 'options.limit' for backward compatibility
		const effectiveLimit = options?.limit ?? limit;
		const response = await searchTags(keyword.trim(), effectiveLimit);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response, null, 2),
				},
			],
		};
	},
};

export default SearchTags;
