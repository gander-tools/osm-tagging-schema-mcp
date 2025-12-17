import { z } from "zod";
import type { OsmToolDefinition } from "../types/index.js";
import { parseTagInput } from "../utils/tag-parser.js";
import { validationOptionsSchema } from "./common-options.js";
import { type ValidationResult, validateTag } from "./validate-tag.js";

/**
 * Result of tag collection validation
 */
export interface CollectionValidationResult {
	/** Whether the entire collection is valid (no errors) */
	valid: boolean;
	/** Validation results for each individual tag */
	tagResults: Record<string, ValidationResult>;
	/** Count of valid tags (no errors) */
	validCount: number;
	/** Count of deprecated tags */
	deprecatedCount: number;
	/** Count of tags with errors */
	errorCount: number;
	/** Optional human-readable summary (only included if options.summary=true) */
	summary?: string;
}

/**
 * Generate a human-readable summary of validation results
 *
 * @param result - Validation result to summarize
 * @param tags - Original tag collection
 * @returns Human-readable summary text
 */
function generateValidationSummary(
	result: CollectionValidationResult,
	tags: Record<string, string>,
): string {
	const totalTags = Object.keys(tags).length;
	const lines: string[] = [];

	// Overall status
	if (result.valid) {
		lines.push("✓ All tags are valid");
	} else {
		lines.push(`✗ ${result.errorCount} tag(s) have errors`);
	}

	// Statistics
	lines.push(
		`\nStatistics: ${totalTags} total tags, ${result.validCount} valid, ${result.deprecatedCount} deprecated, ${result.errorCount} errors`,
	);

	// Deprecation warnings
	if (result.deprecatedCount > 0) {
		lines.push("\n⚠ Deprecated tags found:");
		for (const [key, tagResult] of Object.entries(result.tagResults)) {
			if (tagResult.deprecated && tagResult.replacement) {
				const replacementStr = Object.entries(tagResult.replacement)
					.map(([k, v]) => `${k}=${v}`)
					.join(", ");
				lines.push(`  - ${key}=${tags[key]} → Suggested: ${replacementStr}`);
			}
		}
	}

	// Errors
	if (result.errorCount > 0) {
		lines.push("\n✗ Errors:");
		for (const [key, tagResult] of Object.entries(result.tagResults)) {
			if (!tagResult.valid) {
				lines.push(`  - ${key}=${tags[key]}: ${tagResult.message}`);
			}
		}
	}

	// Recommendations
	if (result.valid && result.deprecatedCount === 0) {
		lines.push("\n✓ No issues found - tags are ready for use");
	} else if (result.valid && result.deprecatedCount > 0) {
		lines.push("\n✓ Tags are valid but consider updating deprecated tags");
	} else {
		lines.push("\n✗ Fix errors before using these tags");
	}

	return lines.join("\n");
}

/**
 * Validate a collection of OSM tags
 *
 * @param tags - Object containing key-value pairs to validate
 * @param options - Optional parameters to control output
 * @returns Validation result with aggregated statistics and individual tag results
 */
export async function validateTagCollection(
	tags: Record<string, string>,
	options?: { summary?: boolean; verbose?: boolean },
): Promise<CollectionValidationResult> {
	const result: CollectionValidationResult = {
		valid: true,
		tagResults: {},
		validCount: 0,
		deprecatedCount: 0,
		errorCount: 0,
	};

	// Validate each tag individually
	for (const [key, value] of Object.entries(tags)) {
		const tagResult = await validateTag(key, value);
		result.tagResults[key] = tagResult;

		// Aggregate statistics
		if (!tagResult.valid) {
			result.valid = false;
			result.errorCount++;
		} else {
			result.validCount++;
			if (tagResult.deprecated) {
				// Deprecated tags that are still valid get counted
				result.deprecatedCount++;
			}
		}
	}

	// Generate summary if requested
	if (options?.summary) {
		result.summary = generateValidationSummary(result, tags);
	}

	return result;
}

const ValidateTagCollection: OsmToolDefinition<{
	tags: z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>;
	options: z.ZodOptional<
		z.ZodObject<{
			summary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
			verbose: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
		}>
	>;
}> = {
	name: "validate_tag_collection" as const,
	config: () => ({
		description:
			"Validate a complete collection of OpenStreetMap tags together, performing comprehensive validation on each tag and providing aggregated statistics. This tool validates each tag individually (using the same validation logic as validate_tag) and then aggregates the results to give you an overall picture of the collection's quality. Returns detailed validation results for each tag (including deprecation warnings, schema validation, and option checking) plus summary statistics (total valid count, deprecated count, error count). Use this for bulk validation of OSM data exports, quality assurance of tag collections before upload, or analyzing the completeness of feature tagging. Accepts input in three flexible formats: JSON object, JSON string, or flat text format (key=value per line).",
		inputSchema: {
			tags: z
				.union([z.string(), z.record(z.string(), z.string())])
				.describe(
					'Collection of OpenStreetMap tags in one of three formats: 1) JSON object (e.g., {"amenity": "restaurant", "name": "Test Cafe", "cuisine": "italian"}), 2) JSON string (e.g., \'{"amenity":"parking"}\'), or 3) flat text format with one tag per line (e.g., "amenity=restaurant\\nname=Test\\ncuisine=italian"). The flat text format supports comments (lines starting with #) and empty lines. All formats are automatically parsed and validated.',
				),
			options: validationOptionsSchema,
		},
	}),
	handler: async ({ tags, options }, _extra) => {
		// Parse tags using the shared parser (handles string, JSON, and object formats)
		const parsedTags = typeof tags === "string" ? parseTagInput(tags) : parseTagInput(tags);

		const result = await validateTagCollection(parsedTags, options);
		return {
			content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
		};
	},
};

export default ValidateTagCollection;
