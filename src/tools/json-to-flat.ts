import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { OsmToolDefinition } from "../types/index.js";

/**
 * Convert OSM tags from JSON format to flat text format (key=value per line)
 *
 * @param input - Tags in JSON format (object or JSON string)
 * @returns Flat text format with key=value per line
 * @throws Error if input is invalid
 */
export function jsonToFlat(input: string | Record<string, unknown>): string {
	// Parse input to validated tags object
	let tags: Record<string, string>;

	if (typeof input === "string") {
		// Try to parse as JSON
		let parsed: unknown;
		try {
			parsed = JSON.parse(input);
		} catch (error) {
			throw new Error(
				`Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		// Validate that parsed value is an object
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
			throw new Error("JSON input must be an object, not an array or primitive");
		}

		tags = validateTags(parsed as Record<string, unknown>);
	} else if (typeof input === "object" && input !== null) {
		tags = validateTags(input);
	} else {
		throw new Error("Input must be a string or object");
	}

	// Convert to flat text format
	const lines: string[] = [];
	for (const [key, value] of Object.entries(tags)) {
		lines.push(`${key}=${value}`);
	}

	return lines.join("\n");
}

/**
 * Validate that all values in the tags object are strings and not empty
 *
 * @param obj - Object to validate
 * @returns Validated tags object
 * @throws Error if any value is not a string or is empty
 */
function validateTags(obj: Record<string, unknown>): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value !== "string") {
			throw new Error(`All values must be strings. Found ${typeof value} for key "${key}"`);
		}
		const trimmedValue = value.trim();
		if (trimmedValue === "") {
			throw new Error(`Tag value cannot be empty for key "${key}"`);
		}
		result[key.trim()] = trimmedValue;
	}

	return result;
}

const JsonToFlat: OsmToolDefinition<{
	tags: z.ZodUnion<readonly [z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>;
}> = {
	name: "json_to_flat" as const,
	config: () => {
		const metadata = requireToolMetadata("json_to_flat");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			inputSchema: {
				tags: z
					.union([z.string(), z.record(z.string(), z.string())])
					.describe(metadata.parameters.jsonTags?.description ?? ""),
			},
		};
	},
	handler: async ({ tags }, _extra) => {
		try {
			const result = jsonToFlat(tags);
			return {
				content: [
					{
						type: "text" as const,
						text: result,
					},
				],
			};
		} catch (error) {
			// Return error message in structured format
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							{
								error: error instanceof Error ? error.message : String(error),
							},
							null,
							2,
						),
					},
				],
				isError: true,
			};
		}
	},
};

export default JsonToFlat;
