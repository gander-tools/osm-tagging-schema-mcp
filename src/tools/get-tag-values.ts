import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { OsmToolDefinition } from "../types/index.js";
import { schemaLoader } from "../utils/schema-loader.js";
import { limitOption } from "./common-options.js";
import type { TagValuesResponse } from "./types.js";

/**
 * Get all possible values for a given tag key with localized names
 *
 * @param tagKey - The tag key to get values for (e.g., "amenity", "building")
 * @param options - Optional parameters to control output
 * @returns Response object with key, keyName, values array, and valuesDetailed array
 */
export async function getTagValues(
	tagKey: string,
	options?: { limit?: number },
): Promise<TagValuesResponse> {
	const schema = await schemaLoader.loadSchema();

	// Collect all unique values for the tag key
	const valueKeys = new Set<string>();

	// First, check fields for predefined options
	// Field map keys are FILE PATHS with slash (e.g., "toilets/wheelchair" → data/fields/toilets/wheelchair.json)
	// To look up a field, convert OSM tag key's colons to slashes
	const fieldKeyLookup = tagKey.replace(/:/g, "/");
	const field = schema.fields[fieldKeyLookup];
	let actualKey = tagKey; // The actual OSM key (with colon)

	if (field) {
		// Use the actual OSM tag key from field.key (e.g., "parking:both" not "parking/side/parking")
		actualKey = field.key;

		if (field.options && Array.isArray(field.options)) {
			for (const option of field.options) {
				if (typeof option === "string") {
					valueKeys.add(option);
				}
			}
		}
	}

	// Then iterate through all presets to find additional values
	// Presets use the actual OSM key format (with colon)
	for (const preset of Object.values(schema.presets)) {
		// Check if this preset has the tag key
		if (preset.tags[actualKey]) {
			const value = preset.tags[actualKey];
			// Skip wildcards and complex patterns
			if (value && value !== "*" && !value.includes("|")) {
				valueKeys.add(value);
			}
		}

		// Also check addTags if present
		if (preset.addTags?.[actualKey]) {
			const value = preset.addTags[actualKey];
			if (value && value !== "*" && !value.includes("|")) {
				valueKeys.add(value);
			}
		}
	}

	// Get localized key name using tag key deduction (NOT field label!)
	// IMPORTANT: Do NOT use getFieldLabel() - that returns form field labels, not tag names
	const keyName = schemaLoader.getTagKeyName(actualKey);

	// Build simple values array and detailed values array
	const values: string[] = [];
	const valuesDetailed: { value: string; valueName: string }[] = [];
	const sortedValueKeys = Array.from(valueKeys).sort();

	// Apply limit if specified
	const limitedValueKeys = options?.limit
		? sortedValueKeys.slice(0, options.limit)
		: sortedValueKeys;

	for (const valueKey of limitedValueKeys) {
		// Add to simple values array
		values.push(valueKey);

		// Get localized value name from presets first, then field options
		// IMPORTANT: Use getTagValueName() which checks presets (e.g., amenity/parking → "Parking Lot")
		const valueName = schemaLoader.getTagValueName(actualKey, valueKey);

		// Add to detailed values array (NO description field in Phase 8.3 format)
		valuesDetailed.push({
			value: valueKey,
			valueName,
		});
	}

	// Return new response format
	return {
		key: actualKey,
		keyName,
		values,
		valuesDetailed,
	};
}

/**
 * Tool definition for get_tag_values following new OsmToolDefinition interface
 *
 * Returns all possible values for a given tag key with localized names.
 */
const GetTagValues: OsmToolDefinition<{
	tagKey: z.ZodString;
	options: z.ZodOptional<
		z.ZodObject<{
			limit: z.ZodOptional<z.ZodNumber>;
		}>
	>;
}> = {
	name: "get_tag_values" as const,

	config: () => {
		const metadata = requireToolMetadata("get_tag_values");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			annotations: {
				title: metadata.title,
			},
			inputSchema: {
				tagKey: z.string().describe(metadata.parameters.tagKey!.description),
				options: z
					.object({
						limit: limitOption,
					})
					.optional()
					.describe(metadata.parameters.options!.description),
			},
		};
	},

	handler: async ({ tagKey, options }, _extra) => {
		const response = await getTagValues(tagKey.trim(), options);

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

export default GetTagValues;
