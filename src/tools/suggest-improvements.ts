import fieldsRaw from "@openstreetmap/id-tagging-schema/dist/fields.json" with { type: "json" };
import presetsRaw from "@openstreetmap/id-tagging-schema/dist/presets.json" with { type: "json" };
import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { Field, OsmToolDefinition, Preset } from "../types";
import { schemaLoader } from "../utils/schema-loader.js";
import { parseTagInput } from "../utils/tag-parser.js";
import { limitOption, summaryOption } from "./common-options.js";

const fields = fieldsRaw as unknown as Record<string, Field>;
const presets = presetsRaw as unknown as Record<string, Preset>;

/**
 * Structured suggestion with operation type and details
 */
export interface Suggestion {
	/** Type of operation: add, remove, or update */
	operation: "add" | "remove" | "update";
	/** Human-readable explanation with reason */
	message: string;
	/** Tag key being suggested */
	key: string;
	/** Localized key name */
	keyName: string;
}

/**
 * Detailed preset information
 */
export interface PresetDetailed {
	/** Preset ID (e.g., "amenity/restaurant") */
	id: string;
	/** Localized preset name */
	name: string;
}

/**
 * Result of improvement suggestions
 */
export interface ImprovementResult {
	/** Structured suggestions for improvements */
	suggestions: Suggestion[];
	/** Matched presets (backward compatibility) */
	matchedPresets: string[];
	/** Detailed preset information */
	matchedPresetsDetailed: PresetDetailed[];
	/** Optional human-readable summary (only included if options.summary=true) */
	summary?: string;
}

/**
 * Generate a human-readable summary of improvement suggestions
 *
 * @param result - Improvement result to summarize
 * @param tags - Original tag collection
 * @returns Human-readable summary text
 */
function generateImprovementSummary(
	result: ImprovementResult,
	tags: Record<string, string>,
): string {
	const lines: string[] = [];

	// Matched presets
	if (result.matchedPresetsDetailed.length > 0) {
		lines.push("✓ Matched Presets:");
		for (const preset of result.matchedPresetsDetailed.slice(0, 3)) {
			lines.push(`  - ${preset.name} (${preset.id})`);
		}
		if (result.matchedPresetsDetailed.length > 3) {
			lines.push(`  ... and ${result.matchedPresetsDetailed.length - 3} more`);
		}
	} else {
		lines.push("⚠ No matching presets found for these tags");
	}

	// Suggestions summary
	const requiredSuggestions = result.suggestions.filter((s) => !s.message.startsWith("Optional"));
	const optionalSuggestions = result.suggestions.filter((s) => s.message.startsWith("Optional"));

	if (result.suggestions.length > 0) {
		lines.push(
			`\n📝 Suggestions: ${requiredSuggestions.length} required, ${optionalSuggestions.length} optional`,
		);

		if (requiredSuggestions.length > 0) {
			lines.push("\nRecommended fields to add:");
			for (const suggestion of requiredSuggestions.slice(0, 5)) {
				lines.push(`  + ${suggestion.key} (${suggestion.keyName})`);
			}
		}

		if (optionalSuggestions.length > 0) {
			lines.push("\nOptional fields for more detail:");
			for (const suggestion of optionalSuggestions.slice(0, 3)) {
				lines.push(`  + ${suggestion.key} (${suggestion.keyName})`);
			}
		}
	} else {
		lines.push("\n✓ No additional fields suggested - tags appear complete");
	}

	// Current tags
	const tagCount = Object.keys(tags).length;
	lines.push(`\nCurrent tags: ${tagCount}`);
	lines.push(`Potential tags after improvements: ${tagCount + result.suggestions.length}`);

	return lines.join("\n");
}

/**
 * Suggest improvements for an OSM tag collection
 *
 * Analyzes tags and provides structured suggestions for missing fields
 * and recommendations based on matched presets.
 *
 * @param tags - Tag collection to analyze
 * @param options - Optional parameters to control output
 * @returns Improvement suggestions with operations and localized names
 */
export async function suggestImprovements(
	tags: Record<string, string>,
	options?: { summary?: boolean; limit?: number },
): Promise<ImprovementResult> {
	const result: ImprovementResult = {
		suggestions: [],
		matchedPresets: [],
		matchedPresetsDetailed: [],
	};

	// Handle empty tag collection
	if (Object.keys(tags).length === 0) {
		return result;
	}

	// Load schema for translation lookups
	await schemaLoader.loadSchema();

	// Find matching presets
	const matchedPresetIds = findMatchingPresets(tags);
	result.matchedPresets = matchedPresetIds;

	// Build detailed preset information
	for (const presetId of matchedPresetIds) {
		const presetName = schemaLoader.getPresetName(presetId);
		result.matchedPresetsDetailed.push({
			id: presetId,
			name: presetName,
		});
	}

	// Determine max presets to process based on limit option
	const maxPresets = options?.limit ? Math.min(options.limit, 5) : 5;

	// Suggest missing fields from matched presets
	if (matchedPresetIds.length > 0) {
		const suggestedFields = new Set<string>();

		for (const presetId of matchedPresetIds.slice(0, maxPresets)) {
			const preset = presets[presetId as keyof typeof presets];
			if (!preset) continue;

			// Get preset name for context
			const presetName = schemaLoader.getPresetName(presetId);

			// Check fields
			if ("fields" in preset && preset.fields) {
				for (const fieldId of preset.fields) {
					// Stop if we've reached the limit
					if (options?.limit && result.suggestions.length >= options.limit) {
						break;
					}

					const fieldKey = getFieldKey(fieldId);
					if (fieldKey && !tags[fieldKey] && !suggestedFields.has(fieldKey)) {
						suggestedFields.add(fieldKey);

						// Get localized field name
						const fieldPath = fieldKey.replace(/:/g, "/");
						const keyName = schemaLoader.getFieldLabel(fieldPath);

						result.suggestions.push({
							operation: "add",
							message: `Add '${fieldKey}' to provide more information about this ${presetName}`,
							key: fieldKey,
							keyName,
						});
					}
				}
			}

			// Check moreFields
			if ("moreFields" in preset && preset.moreFields) {
				for (const fieldId of preset.moreFields.slice(0, 3)) {
					// Limit optional fields
					// Stop if we've reached the limit
					if (options?.limit && result.suggestions.length >= options.limit) {
						break;
					}

					const fieldKey = getFieldKey(fieldId);
					if (fieldKey && !tags[fieldKey] && !suggestedFields.has(fieldKey)) {
						suggestedFields.add(fieldKey);

						// Get localized field name
						const fieldPath = fieldKey.replace(/:/g, "/");
						const keyName = schemaLoader.getFieldLabel(fieldPath);

						result.suggestions.push({
							operation: "add",
							message: `Optional: Add '${fieldKey}' for additional details about this ${presetName}`,
							key: fieldKey,
							keyName,
						});
					}
				}
			}
		}
	}

	// Generate summary if requested
	if (options?.summary) {
		result.summary = generateImprovementSummary(result, tags);
	}

	return result;
}

/**
 * Find presets that match the given tags
 *
 * @param tags - Tags to match against
 * @returns Array of matching preset IDs
 */
function findMatchingPresets(tags: Record<string, string>): string[] {
	const matches: string[] = [];

	for (const [presetId, preset] of Object.entries(presets)) {
		if (!preset.tags || Object.keys(preset.tags).length === 0) continue;

		// Check if all preset tags are present in the input tags
		let allMatch = true;
		for (const [key, value] of Object.entries(preset.tags)) {
			if (value === "*") {
				// Wildcard - just check if key exists
				if (!tags[key]) {
					allMatch = false;
					break;
				}
			} else {
				// Exact match required
				if (tags[key] !== value) {
					allMatch = false;
					break;
				}
			}
		}

		if (allMatch) {
			matches.push(presetId);
		}
	}

	return matches;
}

/**
 * Get the actual field key from a field ID
 *
 * Field IDs can be paths (e.g., "name") or references (e.g., "{amenity}")
 *
 * @param fieldId - Field ID from preset
 * @returns Field key or null
 */
function getFieldKey(fieldId: string): string | null {
	// Skip template references
	if (fieldId.startsWith("{")) {
		return null;
	}

	// Handle direct field references
	const fieldPath = fieldId.replace(/:/g, "/");
	type FieldsType = typeof fields;
	const field = (fields as FieldsType)[fieldPath as keyof FieldsType];

	if (field && "key" in field && field.key) {
		return field.key;
	}

	// Try to use the field ID directly as a key
	return fieldId;
}

const SuggestImprovements: OsmToolDefinition<{
	tags: z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>;
	options: z.ZodOptional<
		z.ZodObject<{
			summary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
			limit: z.ZodOptional<z.ZodNumber>;
		}>
	>;
}> = {
	name: "suggest_improvements" as const,
	config: () => {
		const metadata = requireToolMetadata("suggest_improvements");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			inputSchema: {
				tags: z
					.union([z.string(), z.record(z.string(), z.string())])
					.describe(metadata.parameters.tags!.description),
				options: z
					.object({
						summary: summaryOption,
						limit: limitOption,
					})
					.optional()
					.describe(
						"Options to control suggestion output: 'summary' adds a human-readable summary, 'limit' restricts the number of suggestions returned.",
					),
			},
		};
	},
	handler: async ({ tags, options }, _extra) => {
		// Parse tags using the shared parser (handles string, JSON, and object formats)
		const parsedTags = typeof tags === "string" ? parseTagInput(tags) : parseTagInput(tags);

		const result = await suggestImprovements(parsedTags, options);
		return {
			content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
		};
	},
};

export default SuggestImprovements;
