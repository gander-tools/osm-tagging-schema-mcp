/**
 * Common options schema for OSM tagging schema tools
 *
 * Provides reusable Zod schemas for tool options that control output behavior,
 * formatting, and verbosity. Tools can selectively use these options based on
 * their specific needs.
 */

import { z } from "zod";

/**
 * Common tool options interface
 *
 * Tools may support a subset of these options based on their functionality.
 */
export interface ToolOptions {
	/** Include a summary/analysis in the output (default: false) */
	summary?: boolean;

	/** Limit the number of results returned (default: unlimited) */
	limit?: number;

	/** Include verbose/additional details in the output (default: false) */
	verbose?: boolean;

	/** Output format variation (tool-specific) */
	format?: "json" | "text" | "compact";
}

/**
 * Zod schema for summary option
 *
 * Controls whether a summary/analysis is included in the output.
 * Default: false (no summary unless requested)
 */
export const summaryOption = z
	.boolean()
	.optional()
	.default(false)
	.describe(
		"Include a summary or analysis in the output. Default: false. When enabled, adds human-readable summaries, recommendations, or insights to the response.",
	);

/**
 * Zod schema for limit option
 *
 * Controls the maximum number of results returned.
 * Default: undefined (no limit)
 */
export const limitOption = z
	.number()
	.int()
	.positive()
	.optional()
	.describe(
		"Maximum number of results to return. Default: unlimited. Use this to limit large result sets for performance or readability.",
	);

/**
 * Zod schema for verbose option
 *
 * Controls whether additional details are included in the output.
 * Default: false (concise output)
 */
export const verboseOption = z
	.boolean()
	.optional()
	.default(false)
	.describe(
		"Include verbose/additional details in the output. Default: false. When enabled, adds extra information like field descriptions, usage notes, or detailed explanations.",
	);

/**
 * Zod schema for format option
 *
 * Controls the output format variation.
 * Default: "json" (structured JSON output)
 */
export const formatOption = z
	.enum(["json", "text", "compact"])
	.optional()
	.default("json")
	.describe(
		"Output format variation. Options: 'json' (default, structured JSON), 'text' (human-readable text), 'compact' (minimal output). Not all tools support all formats.",
	);

/**
 * Diff format enum values
 */
const diffFormatEnum = {
	unified: "unified",
	split: "split",
	summary: "summary",
} as const;

/**
 * Zod schema for diff format option
 *
 * Controls how tag differences are displayed.
 * Default: "unified" (unified diff format)
 */
export const diffFormatOption = z
	.enum(diffFormatEnum)
	.optional()
	.default("unified")
	.describe(
		"Diff output format. Options: 'unified' (default, shows changes with +/- symbols), 'split' (side-by-side old/new), 'summary' (statistics only).",
	);

/**
 * Zod schema for showUnchanged option
 *
 * Controls whether unchanged tags are shown in diff output.
 * Default: false (hide unchanged tags)
 */
export const showUnchangedOption = z
	.boolean()
	.optional()
	.default(false)
	.describe("Show unchanged tags in diff output. Default: false (only show changes).");

/**
 * Complete options schema
 *
 * Combines all common options. Tools can use this as-is or create custom
 * schemas with a subset of options.
 */
export const toolOptionsSchema = z
	.object({
		summary: summaryOption,
		limit: limitOption,
		verbose: verboseOption,
		format: formatOption,
	})
	.optional()
	.describe("Optional parameters to control tool output behavior, formatting, and verbosity.");

/**
 * Partial options schemas for tools that need specific subsets
 */

/** Options for validation tools (summary, verbose) */
export const validationOptionsSchema = z
	.object({
		summary: summaryOption,
		verbose: verboseOption,
	})
	.optional()
	.describe("Options to control validation output detail and summary generation.");

/** Options for search tools (limit, verbose) */
export const searchOptionsSchema = z
	.object({
		limit: limitOption,
		verbose: verboseOption,
	})
	.optional()
	.describe("Options to control search result limits and detail level.");

/** Options for query tools (limit, format) */
export const queryOptionsSchema = z
	.object({
		limit: limitOption,
		format: formatOption,
	})
	.optional()
	.describe("Options to control query result limits and output format.");

/** Options for comparison tools (diffFormat, showUnchanged) */
export const comparisonOptionsSchema = z
	.object({
		diffFormat: diffFormatOption,
		showUnchanged: showUnchangedOption,
	})
	.optional()
	.describe("Options to control diff output format and visibility of unchanged tags.");
