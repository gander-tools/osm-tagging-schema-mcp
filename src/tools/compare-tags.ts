import { z } from "zod";
import { requireToolMetadata } from "../metadata.js";
import type { OsmToolDefinition } from "../types/index.js";
import { parseTagInput } from "../utils/tag-parser.js";
import { comparisonOptionsSchema } from "./common-options.js";

/**
 * Type of change for a tag
 */
export type ChangeType = "added" | "removed" | "modified" | "unchanged";

/**
 * Details of a tag change
 */
export interface TagChange {
	/** Type of change */
	type: ChangeType;
	/** Tag key */
	key: string;
	/** Old value (undefined for added tags) */
	oldValue?: string;
	/** New value (undefined for removed tags) */
	newValue?: string;
}

/**
 * Statistics about tag changes
 */
export interface ChangeStatistics {
	/** Total number of changes */
	total: number;
	/** Number of added tags */
	added: number;
	/** Number of removed tags */
	removed: number;
	/** Number of modified tags */
	modified: number;
	/** Number of unchanged tags */
	unchanged: number;
}

/**
 * Result of tag comparison
 */
export interface ComparisonResult {
	/** List of all tag changes */
	changes: TagChange[];
	/** Statistics about changes */
	statistics: ChangeStatistics;
	/** Formatted diff output (only if options.diffFormat is specified) */
	diff?: string;
}

/**
 * Compare two tag collections and identify changes
 *
 * @param oldTags - Original tag collection
 * @param newTags - Updated tag collection
 * @param options - Optional parameters to control output
 * @returns Comparison result with changes, statistics, and optional diff
 */
export async function compareTags(
	oldTags: Record<string, string>,
	newTags: Record<string, string>,
	options?: { diffFormat?: "unified" | "split" | "summary"; showUnchanged?: boolean },
): Promise<ComparisonResult> {
	const changes: TagChange[] = [];
	const statistics: ChangeStatistics = {
		total: 0,
		added: 0,
		removed: 0,
		modified: 0,
		unchanged: 0,
	};

	// Get all unique keys from both collections
	const allKeys = new Set([...Object.keys(oldTags), ...Object.keys(newTags)]);

	// Analyze each key
	for (const key of Array.from(allKeys).sort()) {
		const oldValue = oldTags[key];
		const newValue = newTags[key];

		if (oldValue === undefined && newValue !== undefined) {
			// Tag was added
			changes.push({
				type: "added",
				key,
				newValue,
			});
			statistics.added++;
			statistics.total++;
		} else if (oldValue !== undefined && newValue === undefined) {
			// Tag was removed
			changes.push({
				type: "removed",
				key,
				oldValue,
			});
			statistics.removed++;
			statistics.total++;
		} else if (oldValue !== newValue) {
			// Tag value was modified
			changes.push({
				type: "modified",
				key,
				oldValue,
				newValue,
			});
			statistics.modified++;
			statistics.total++;
		} else {
			// Tag is unchanged
			if (options?.showUnchanged) {
				changes.push({
					type: "unchanged",
					key,
					oldValue,
					newValue,
				});
			}
			statistics.unchanged++;
		}
	}

	// Generate diff output if requested
	const result: ComparisonResult = {
		changes,
		statistics,
	};

	if (options?.diffFormat) {
		result.diff = generateDiff(changes, statistics, options.diffFormat);
	}

	return result;
}

/**
 * Generate formatted diff output
 *
 * @param changes - List of tag changes
 * @param statistics - Change statistics
 * @param format - Diff format (unified, split, or summary)
 * @returns Formatted diff string
 */
function generateDiff(
	changes: TagChange[],
	statistics: ChangeStatistics,
	format: "unified" | "split" | "summary",
): string {
	if (format === "summary") {
		return generateSummaryDiff(statistics);
	}

	if (format === "split") {
		return generateSplitDiff(changes);
	}

	// Default: unified format
	return generateUnifiedDiff(changes);
}

/**
 * Generate summary-only diff
 */
function generateSummaryDiff(statistics: ChangeStatistics): string {
	const lines: string[] = [];

	lines.push("📊 Change Summary");
	lines.push("─".repeat(40));
	lines.push(`Total changes: ${statistics.total}`);
	lines.push(`  ✅ Added: ${statistics.added}`);
	lines.push(`  ❌ Removed: ${statistics.removed}`);
	lines.push(`  ✏️  Modified: ${statistics.modified}`);
	lines.push(`  ⚪ Unchanged: ${statistics.unchanged}`);

	return lines.join("\n");
}

/**
 * Generate unified diff format (like git diff)
 */
function generateUnifiedDiff(changes: TagChange[]): string {
	const lines: string[] = [];

	lines.push("📝 Tag Changes (Unified Diff)");
	lines.push("─".repeat(40));

	for (const change of changes) {
		switch (change.type) {
			case "added":
				lines.push(`+ ${change.key}=${change.newValue}`);
				break;
			case "removed":
				lines.push(`- ${change.key}=${change.oldValue}`);
				break;
			case "modified":
				lines.push(`- ${change.key}=${change.oldValue}`);
				lines.push(`+ ${change.key}=${change.newValue}`);
				break;
			case "unchanged":
				lines.push(`  ${change.key}=${change.oldValue}`);
				break;
		}
	}

	return lines.join("\n");
}

/**
 * Generate split diff format (side-by-side)
 */
function generateSplitDiff(changes: TagChange[]): string {
	const lines: string[] = [];

	lines.push("📝 Tag Changes (Split View)");
	lines.push("─".repeat(80));
	lines.push("OLD                              │ NEW");
	lines.push("─".repeat(80));

	for (const change of changes) {
		const leftPad = 32;
		const oldSide = change.oldValue !== undefined ? `${change.key}=${change.oldValue}` : "";
		const newSide = change.newValue !== undefined ? `${change.key}=${change.newValue}` : "";

		const leftPadded = oldSide.padEnd(leftPad);
		const symbol = getChangeSymbol(change.type);

		lines.push(`${leftPadded} ${symbol} ${newSide}`);
	}

	return lines.join("\n");
}

/**
 * Get symbol for change type
 */
function getChangeSymbol(type: ChangeType): string {
	switch (type) {
		case "added":
			return "│+";
		case "removed":
			return "│-";
		case "modified":
			return "│~";
		case "unchanged":
			return "│ ";
	}
}

const CompareTags: OsmToolDefinition = {
	name: "compare_tags" as const,
	config: () => {
		const metadata = requireToolMetadata("compare_tags");

		return {
			name: metadata.name,
			title: metadata.title,
			description: metadata.description,
			annotations: {
				title: metadata.title,
			},
			inputSchema: {
				oldTags: z
					.union([z.string(), z.record(z.string(), z.string())])
					.describe(metadata.parameters.oldTags!.description),
				newTags: z
					.union([z.string(), z.record(z.string(), z.string())])
					.describe(metadata.parameters.newTags!.description),
				options: comparisonOptionsSchema.describe(metadata.parameters.options!.description),
			},
		};
	},
	handler: async ({ oldTags, newTags, options }, _extra) => {
		// Parse both tag collections
		const parsedOldTags =
			typeof oldTags === "string"
				? parseTagInput(oldTags as string)
				: parseTagInput(oldTags as Record<string, string>);
		const parsedNewTags =
			typeof newTags === "string"
				? parseTagInput(newTags as string)
				: parseTagInput(newTags as Record<string, string>);

		const result = await compareTags(
			parsedOldTags,
			parsedNewTags,
			options as {
				diffFormat?: "unified" | "split" | "summary";
				showUnchanged?: boolean;
			},
		);
		return {
			content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
		};
	},
};

export default CompareTags;
