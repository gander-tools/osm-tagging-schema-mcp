import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { OsmToolDefinition, Preset, SchemaData } from "../types/index.js";
import { schemaLoader } from "../utils/schema-loader.js";
import type { PresetDetails, TagDetailed } from "./types.js";

/**
 * Template definitions for field expansion
 * Based on iD editor conventions
 * Only includes field IDs that exist in @openstreetmap/id-tagging-schema fields.json
 *
 * Templates allow presets to reference commonly used field groups using
 * {@templates/name} syntax. When expanded, they become regular field IDs.
 *
 * Note: Some templates may be empty if the referenced fields don't exist
 * in the current schema version.
 */
const TEMPLATES: Record<string, string[]> = {
	contact: ["email", "phone", "website", "fax"],
	internet_access: ["internet_access", "internet_access/fee", "internet_access/ssid"],
	poi: ["name", "address"],
	"crossing/markings": ["crossing/markings"],
	"crossing/defaults": ["crossing", "crossing/markings"],
	"crossing/geometry_way_more": ["crossing/island"],
	"crossing/bicycle_more": [], // Empty - referenced fields don't exist in schema
	"crossing/markings_yes": ["crossing/markings_yes"],
	"crossing/traffic_signal": ["crossing/light", "button_operated"],
	"crossing/traffic_signal_more": ["traffic_signals/sound", "traffic_signals/vibration"],
};

/**
 * Find preset by tag key-value pair
 * @param schema - The loaded schema data
 * @param tagNotation - Tag in "key=value" format
 * @returns The preset ID or null if not found
 */
function findPresetByTag(schema: SchemaData, tagNotation: string): string | null {
	const [key, value] = tagNotation.split("=");
	if (!key || !value) {
		return null;
	}

	// Use schema loader's index to find presets with this tag
	const presets = schemaLoader.findPresetsByTag(key, value);

	// Return the first exact match (most specific preset)
	// Prefer presets with exact tag match over wildcard
	for (const preset of presets) {
		const presetId = findPresetId(schema, preset);
		if (presetId) {
			const presetTags = preset.tags;
			// Check if this is an exact match (not wildcard)
			if (presetTags[key] === value) {
				return presetId;
			}
		}
	}

	// If no exact match, return first preset
	if (presets.length > 0 && presets[0]) {
		return findPresetId(schema, presets[0]);
	}

	return null;
}

/**
 * Find preset ID by preset object
 * @param schema - The loaded schema data
 * @param preset - The preset object
 * @returns The preset ID
 */
function findPresetId(schema: SchemaData, preset: Preset): string | null {
	for (const [id, p] of Object.entries(schema.presets)) {
		if (p === preset) {
			return id;
		}
	}
	return null;
}

/**
 * Find preset by tags object
 * @param schema - The loaded schema data
 * @param tags - Tags object like {"amenity": "restaurant"}
 * @returns The preset ID or null if not found
 */
function findPresetByTags(schema: SchemaData, tags: Record<string, string>): string | null {
	// Find presets that match all provided tags
	const tagEntries = Object.entries(tags);
	if (tagEntries.length === 0) {
		return null;
	}

	// Start with presets matching the first tag
	const firstEntry = tagEntries[0];
	if (!firstEntry) {
		return null;
	}
	const [firstKey, firstValue] = firstEntry;
	let candidates = schemaLoader.findPresetsByTag(firstKey, firstValue);

	// Filter by remaining tags
	for (let i = 1; i < tagEntries.length; i++) {
		const entry = tagEntries[i];
		if (!entry) {
			continue;
		}
		const [key, value] = entry;
		candidates = candidates.filter((preset) => {
			const presetValue = preset.tags[key];
			return presetValue === value || presetValue === "*";
		});
	}

	// Return the best match
	if (candidates.length > 0 && candidates[0]) {
		// Sort by preference:
		// 1. Exact match (same number of tags)
		// 2. More specific (more tags)
		const inputTagCount = tagEntries.length;
		candidates.sort((a, b) => {
			const aTagCount = Object.keys(a.tags).length;
			const bTagCount = Object.keys(b.tags).length;

			// Prefer exact match
			const aIsExact = aTagCount === inputTagCount;
			const bIsExact = bTagCount === inputTagCount;
			if (aIsExact && !bIsExact) return -1;
			if (!aIsExact && bIsExact) return 1;

			// Otherwise, prefer more specific (more tags)
			return bTagCount - aTagCount;
		});
		return findPresetId(schema, candidates[0]);
	}

	return null;
}

/**
 * Expand field references in a field list
 * Supports:
 * - {preset_id}: Inherit fields from another preset
 * - {@templates/name}: Expand template to field list
 *
 * @param schema - The loaded schema data
 * @param fields - Array of field names with possible references
 * @param visited - Set of visited presets to prevent infinite recursion
 * @returns Expanded array of field names
 */
function expandFieldReferences(
	schema: SchemaData,
	fields: string[] | undefined,
	visited: Set<string> = new Set(),
): string[] {
	if (!fields || fields.length === 0) {
		return [];
	}

	const expanded: string[] = [];

	for (const field of fields) {
		// Template reference: {@templates/contact}
		if (field.startsWith("{@templates/")) {
			const templateName = field.slice("{@templates/".length, -1); // Remove prefix and }
			const templateFields = TEMPLATES[templateName];
			if (templateFields) {
				expanded.push(...templateFields);
			} else {
				// Unknown template, keep as-is
				expanded.push(field);
			}
		}
		// Preset field reference: {building}
		else if (field.startsWith("{") && field.endsWith("}")) {
			const presetId = field.slice(1, -1); // Remove { and }

			// Prevent infinite recursion
			if (visited.has(presetId)) {
				continue;
			}
			visited.add(presetId);

			// Look up the preset and expand its fields recursively
			const referencedPreset = schema.presets[presetId];
			if (referencedPreset) {
				const inheritedFields = expandFieldReferences(schema, referencedPreset.fields, visited);
				expanded.push(...inheritedFields);
			} else {
				// Unknown preset reference, keep as-is
				expanded.push(field);
			}
		}
		// Regular field name
		else {
			expanded.push(field);
		}
	}

	return expanded;
}

/**
 * Build tagsDetailed array with localized names
 * @param tags - The tags object
 * @returns Array of detailed tag information
 */
function buildTagsDetailed(tags: Record<string, string>): TagDetailed[] {
	const tagsDetailed: TagDetailed[] = [];

	for (const [key, value] of Object.entries(tags)) {
		// Skip wildcard values
		if (value === "*") {
			continue;
		}

		// Get localized key name using tag key deduction (NOT field label!)
		const keyName = schemaLoader.getTagKeyName(key);

		// Get localized value name from presets first, then field options
		const valueName = schemaLoader.getTagValueName(key, value);

		tagsDetailed.push({
			key,
			keyName,
			value,
			valueName,
		});
	}

	return tagsDetailed;
}

/**
 * Get complete details for a specific preset
 *
 * @param input - The preset identifier (preset ID, tag notation, or tags object)
 * @returns Complete preset details including tags, geometry, fields, and metadata
 * @throws Error if preset is not found
 */
export async function getPresetDetails(
	input: string | Record<string, string>,
): Promise<PresetDetails> {
	const schema = await schemaLoader.loadSchema();

	// Parse input to get preset ID
	let presetId: string | null = null;

	if (typeof input === "string") {
		if (input.includes("=")) {
			// Format 2: Tag notation "amenity=restaurant"
			presetId = findPresetByTag(schema, input);
		} else {
			// Format 1: Preset ID "amenity/restaurant"
			presetId = input;
		}
	} else {
		// Format 3: Tags object {"amenity": "restaurant"}
		presetId = findPresetByTags(schema, input);
	}

	if (!presetId) {
		const inputStr = typeof input === "string" ? input : JSON.stringify(input);
		throw new Error(`Preset not found for input: ${inputStr}`);
	}

	// Look up the preset
	const preset = schema.presets[presetId];

	if (!preset) {
		const inputStr = typeof input === "string" ? input : JSON.stringify(input);
		throw new Error(`Preset "${presetId}" not found (from input: ${inputStr})`);
	}

	// Get localized preset name
	const name = schemaLoader.getPresetName(presetId);

	// Build tagsDetailed with translations
	const tagsDetailed = buildTagsDetailed(preset.tags);

	// Expand field references
	const expandedFields = expandFieldReferences(schema, preset.fields);
	const expandedMoreFields = expandFieldReferences(schema, preset.moreFields);

	// Build the result with all available properties
	const result: PresetDetails = {
		id: presetId,
		name,
		tags: preset.tags,
		tagsDetailed,
		geometry: preset.geometry,
	};

	// Add optional properties if they exist (after expansion)
	if (expandedFields.length > 0) {
		result.fields = expandedFields;
	}

	if (expandedMoreFields.length > 0) {
		result.moreFields = expandedMoreFields;
	}

	return result;
}

/**
 * Handler for get_preset_details tool
 */
const GetPresetDetails: OsmToolDefinition<{
	presetId: z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>;
}> = {
	name: "get_preset_details" as const,
	config: () => {
		const metadata = requireToolMetadata("get_preset_details");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			annotations: {
				title: metadata.title,
			},
			inputSchema: {
				presetId: z
					.union([z.string(), z.record(z.string(), z.string())])
					.describe(metadata.parameters.presetId!.description),
			},
		};
	},
	handler: async ({ presetId }, _extra) => {
		const input = typeof presetId === "string" ? presetId.trim() : presetId;
		const details = await getPresetDetails(input);
		return {
			content: [{ type: "text" as const, text: JSON.stringify(details, null, 2) }],
		};
	},
};

export default GetPresetDetails;
