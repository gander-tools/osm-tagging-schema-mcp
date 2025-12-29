import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { GeometryType, OsmToolDefinition } from "../types/index.js";
import { schemaLoader } from "../utils/schema-loader.js";
import { limitOption } from "./common-options.js";
import type { PresetSearchResult, TagDetailed } from "./types.js";

/**
 * Options for searching presets
 */
export interface SearchPresetsOptions {
	limit?: number;
	geometry?: GeometryType;
}

/**
 * Search for presets by keyword or tag
 *
 * @param keyword - Keyword to search for in preset IDs and tags
 * @param options - Optional search options (limit, geometry filter)
 * @returns Array of matching presets with id, tags, and geometry
 */
export async function searchPresets(
	keyword: string,
	options?: SearchPresetsOptions,
): Promise<PresetSearchResult[]> {
	const schema = await schemaLoader.loadSchema();
	const results: PresetSearchResult[] = [];

	// Normalize keyword for case-insensitive search
	const normalizedKeyword = keyword.toLowerCase();

	// Check if searching by tag (contains "=")
	const isTagSearch = normalizedKeyword.includes("=");
	let searchKey: string | undefined;
	let searchValue: string | undefined;

	if (isTagSearch) {
		const parts = normalizedKeyword.split("=");
		searchKey = parts[0];
		searchValue = parts[1];
	}

	// Search through all presets
	for (const [presetId, preset] of Object.entries(schema.presets)) {
		let matches = false;

		if (isTagSearch) {
			// Tag-based search: exact match on key and value
			if (searchKey && searchValue) {
				const tagValue = preset.tags[searchKey];
				if (tagValue?.toLowerCase() === searchValue) {
					matches = true;
				}
			}
		} else {
			// Keyword search: search in preset ID
			if (presetId.toLowerCase().includes(normalizedKeyword)) {
				matches = true;
			}

			// Also search in tag keys and values
			if (!matches) {
				for (const [key, value] of Object.entries(preset.tags)) {
					if (
						key.toLowerCase().includes(normalizedKeyword) ||
						(typeof value === "string" && value.toLowerCase().includes(normalizedKeyword))
					) {
						matches = true;
						break;
					}
				}
			}
		}

		// Apply geometry filter if specified
		if (matches && options?.geometry) {
			if (!preset.geometry.includes(options.geometry)) {
				matches = false;
			}
		}

		// Add to results if matches
		if (matches) {
			// Get localized preset name
			const name = schemaLoader.getPresetName(presetId);

			// Build tagsDetailed with localized names
			const tagsDetailed: TagDetailed[] = Object.entries(preset.tags).map(([key, value]) => {
				// Get localized key name using tag key deduction (NOT field label!)
				const keyName = schemaLoader.getTagKeyName(key);

				// Get localized value name from presets first, then field options
				let valueName: string;
				if (value === "*") {
					// For wildcard values, use asterisk as-is
					valueName = "*";
				} else {
					// Use getTagValueName() which checks presets first
					valueName = schemaLoader.getTagValueName(key, value);
				}

				return {
					key,
					keyName,
					value,
					valueName,
				};
			});

			results.push({
				id: presetId,
				name,
				tags: preset.tags,
				tagsDetailed,
				geometry: preset.geometry,
			});

			// Stop if we reached the limit
			if (options?.limit !== undefined && results.length >= options.limit) {
				break;
			}
		}
	}

	return results;
}

/**
 * Tool definition for search_presets following new OsmToolDefinition interface
 */
const geometryEnum = {
	point: "point",
	vertex: "vertex",
	line: "line",
	area: "area",
	relation: "relation",
} as const;

type GeometryEnum = typeof geometryEnum;

const SearchPresets: OsmToolDefinition<{
	keyword: z.ZodString;
	limit: z.ZodOptional<z.ZodNumber>;
	geometry: z.ZodOptional<z.ZodEnum<GeometryEnum>>;
	options: z.ZodOptional<
		z.ZodObject<{
			limit: z.ZodOptional<z.ZodNumber>;
			geometry: z.ZodOptional<z.ZodEnum<GeometryEnum>>;
		}>
	>;
}> = {
	name: "search_presets" as const,

	config: () => {
		const metadata = requireToolMetadata("search_presets");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			inputSchema: {
				keyword: z.string().describe(metadata.parameters.searchName!.description),
				limit: z
					.number()
					.optional()
					.describe(
						"(Deprecated: use options.limit instead) Maximum number of preset results to return (optional, no default limit). Use this to get faster responses when you only need a few results, or to avoid overwhelming output when searching broad terms. Example: limit=10 returns only the first 10 matches.",
					),
				geometry: z
					.enum(geometryEnum)
					.optional()
					.describe(
						"(Deprecated: use options.geometry instead) Filter results to only presets that support a specific geometry type (optional). Valid values: 'point' (nodes/POIs), 'vertex' (nodes along ways), 'line' (open ways like roads/rivers), 'area' (closed ways/areas like buildings/parks), 'relation' (complex features). Example: geometry='area' returns only presets that can be applied to area features.",
					),
				options: z
					.object({
						limit: limitOption,
						geometry: z
							.enum(geometryEnum)
							.optional()
							.describe(metadata.parameters.geometry!.description),
					})
					.optional()
					.describe(metadata.parameters.options!.description),
			},
		};
	},

	handler: async ({ keyword, limit, geometry, options }, _extra) => {
		// Support both old parameters and new options for backward compatibility
		const effectiveLimit = options?.limit ?? limit;
		const effectiveGeometry = options?.geometry ?? geometry;

		const results = await searchPresets(keyword.trim(), {
			limit: effectiveLimit,
			geometry: effectiveGeometry,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(results, null, 2),
				},
			],
		};
	},
};

export default SearchPresets;
