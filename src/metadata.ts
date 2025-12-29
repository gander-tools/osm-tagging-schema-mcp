/**
 * Centralized metadata for MCP server capabilities
 *
 * This file contains all descriptions, labels, and instructions for:
 * - Tools (parameters, descriptions)
 * - Prompts (parameters, descriptions)
 * - Resources (static/semi-static content)
 *
 * This file is NOT subject to translations but makes maintenance easier
 * by centralizing all user-facing text.
 */

import type { z } from "zod";

/**
 * ============================================================================
 * TOOLS METADATA
 * ============================================================================
 */

export interface ToolParameterMetadata {
	/** Parameter description shown to users */
	description: string;
	/** Optional detailed instructions or examples */
	instructions?: string;
	/** Optional label for UI display */
	label?: string;
}

export interface ToolMetadata {
	/** Tool name (identifier) */
	name: string;
	/** Tool description */
	description: string;
	/** Parameter metadata */
	parameters: Record<string, ToolParameterMetadata>;
}

/**
 * Tool descriptions and parameter metadata
 */
export const toolsMetadata: Record<string, ToolMetadata> = {
	validate_tag: {
		name: "validate_tag",
		description:
			"Validate a single OpenStreetMap tag key-value pair against the OSM tagging schema. Performs comprehensive validation including: deprecation checking (identifies deprecated tags and suggests modern replacements), schema existence validation (verifies the tag key exists in the schema), option validation (checks if the value is in predefined options for that key), and field type checking (distinguishes between strict fields and combo fields that allow custom values). Returns detailed validation results with localized names and actionable messages. Use this for educational purposes, data quality checks, or validating individual tags before bulk operations.",
		parameters: {
			key: {
				description:
					"The OpenStreetMap tag key to validate (e.g., 'amenity', 'building', 'highway', 'natural'). Tag keys should use the standard OSM format with colons for namespaces (e.g., 'addr:street', 'name:en'). Case-sensitive.",
				label: "Tag Key",
			},
			value: {
				description:
					"The OpenStreetMap tag value to validate against the specified key (e.g., 'restaurant', 'yes', 'residential', 'park'). Values are checked against predefined options if the field has them. Case-sensitive in most cases, though some fields may accept case-insensitive values.",
				label: "Tag Value",
			},
		},
	},

	validate_tag_collection: {
		name: "validate_tag_collection",
		description:
			"Validate a complete collection of OpenStreetMap tags (e.g., all tags for a feature) against the OSM tagging schema. Performs batch validation of multiple tag pairs, checks for deprecated tags across the entire collection, identifies conflicting or incompatible tags, and validates tag combinations. Returns comprehensive validation results for all tags with individual validation status, deprecation warnings, and collection-level issues. Use this to validate complete features before uploading to OSM or for data quality analysis of existing features.",
		parameters: {
			tags: {
				description:
					'A collection of OpenStreetMap tags to validate. Accepts three formats: 1) JSON object ({"amenity": "restaurant", "name": "Example"}), 2) JSON string (\'{"amenity":"parking"}\'), or 3) flat text format (amenity=restaurant\\nname=Example). All tags in the collection will be validated individually and as a set to identify conflicts or missing required tags.',
				label: "Tags",
				instructions:
					'Supports three formats:\n1. JSON object: {"amenity": "restaurant", "name": "Test Cafe", "cuisine": "italian"}\n2. JSON string: \'{"amenity":"parking"}\'\n3. Flat text: amenity=restaurant\\nname=Test Cafe\\ncuisine=italian',
			},
		},
	},

	suggest_improvements: {
		name: "suggest_improvements",
		description:
			"Analyze an OpenStreetMap tag collection and provide intelligent suggestions for improvements. Identifies the feature type from existing tags, finds the matching OSM preset, compares current tags against preset requirements, suggests missing required fields, recommends commonly used optional fields, and provides examples for suggested fields. Returns prioritized improvement suggestions with explanations and example values. Use this to enhance incomplete features, learn best practices for tagging specific feature types, or improve data quality of existing OSM data.",
		parameters: {
			tags: {
				description:
					'Current tags for the OSM feature to analyze. Accepts three formats: 1) JSON object ({"amenity": "restaurant", "name": "Example"}), 2) JSON string (\'{"amenity":"parking"}\'), or 3) flat text format (amenity=restaurant\\nname=Example). The tool will analyze these tags to identify the feature type and suggest appropriate additional tags.',
				label: "Current Tags",
				instructions:
					'Supports three formats:\n1. JSON object: {"amenity": "restaurant", "name": "Test"}\n2. JSON string: \'{"amenity":"parking"}\'\n3. Flat text: amenity=restaurant\\nname=Test',
			},
		},
	},

	get_tag_values: {
		name: "get_tag_values",
		description:
			"Retrieve all possible values for a specific OpenStreetMap tag key, with localized human-readable names for both the key and each value. This tool searches through the OSM tagging schema (both predefined field options and preset definitions) to find every documented value that can be used with the specified key. Returns four pieces of information: the normalized key name, localized key display name, a simple array of all values, and a detailed array with localized names for each value. Use this to discover what values are available for a tag (e.g., all amenity types), learn the proper terminology for values, or build UI selection lists. Essential for understanding OSM's controlled vocabularies.",
		parameters: {
			tagKey: {
				description:
					"The OpenStreetMap tag key to retrieve values for (e.g., 'amenity', 'building', 'highway', 'natural', 'shop'). Supports both simple keys and namespaced keys with colons (e.g., 'addr:street', 'name:en'). The tool will search both field definitions and preset tags to find all documented values. Case-sensitive, use lowercase for standard OSM keys.",
				label: "Tag Key",
			},
			options: {
				description:
					"Options to control query output: 'limit' restricts the maximum number of values returned (useful for tags with many values like 'name').",
				label: "Options",
			},
		},
	},

	search_tags: {
		name: "search_tags",
		description:
			"Search for OpenStreetMap tags by single keyword or pattern. Searches across tag keys, tag values, and localized names to find matching tags. Supports fuzzy matching to find tags even with slight typos or variations. Returns matching tags with their keys, values, and human-readable names. Use this to discover tags related to a topic, find the correct tag when you know part of the name, or explore available tags in a category. For tag pair filtering (e.g., amenity=restaurant), use search_presets instead. Essential for learning OSM tagging vocabulary and discovering lesser-known tags.",
		parameters: {
			keyword: {
				description:
					"Single standalone keyword or pattern to search for in tag keys, values, and names (e.g., 'restaurant', 'bicycle', 'wheelchair'). The search is case-insensitive and supports partial matching. Will search across tag keys (e.g., 'amenity'), tag values (e.g., 'restaurant'), and localized display names. For tag pair filtering (e.g., amenity=restaurant), use search_presets instead.",
				label: "Search Keyword",
			},
			options: {
				description:
					"Options to control search behavior and output: 'limit' restricts the maximum number of results returned.",
				label: "Options",
			},
		},
	},

	search_presets: {
		name: "search_presets",
		description:
			"Search for OpenStreetMap presets by name, tags, or geometry type. Presets are predefined feature templates that define how specific types of features should be tagged (e.g., 'Restaurant' preset defines standard tags for restaurants). Supports filtering by preset name keywords, specific tag filters, and geometry type (point/line/area/relation). Returns matching presets with their names, primary tags, geometry types, and match scores. Use this to find the correct preset for a feature type, discover how to tag specific features, or explore available feature templates in OSM.",
		parameters: {
			searchName: {
				description:
					"Optional keyword to search in preset names (e.g., 'restaurant', 'park', 'school'). Case-insensitive search that matches against preset display names. Leave empty to search by tags or geometry only.",
				label: "Search Name",
			},
			tagFilters: {
				description:
					'Optional tag filters to match presets (e.g., {"amenity": "restaurant"}). Only presets that include all specified tags will be returned. Useful for finding presets that use specific tag combinations.',
				label: "Tag Filters",
				instructions: 'Example: {"amenity": "restaurant"} finds all restaurant-related presets',
			},
			geometry: {
				description:
					"Optional geometry type filter: 'point', 'line', 'area', or 'relation'. Only presets that support the specified geometry will be returned. Useful for finding what can be mapped as a specific geometry type.",
				label: "Geometry Type",
			},
			options: {
				description:
					"Options to control search behavior and output: 'limit' restricts the maximum number of results returned.",
				label: "Options",
			},
		},
	},

	get_preset_details: {
		name: "get_preset_details",
		description:
			"Get complete detailed information about a specific OpenStreetMap preset. Presets are feature templates that define standard tagging patterns (e.g., the 'Restaurant' preset defines amenity=restaurant and lists fields like cuisine, outdoor_seating, etc.). Returns comprehensive preset information including: display name, all required and suggested tags, supported geometry types, complete list of fields (with template expansion), field types and options, and parent/child preset relationships. Use this to understand exactly how to tag a specific feature type, learn what fields are available for a preset, or get example values for proper tagging.",
		parameters: {
			presetId: {
				description:
					"The preset identifier to retrieve (e.g., 'amenity/restaurant', 'highway/residential', 'natural/tree'). Preset IDs follow the pattern 'key/value' corresponding to the primary tag. Use search_presets to find preset IDs.",
				label: "Preset ID",
				instructions: "Example: 'amenity/restaurant' for restaurant preset",
			},
		},
	},

	compare_tags: {
		name: "compare_tags",
		description:
			"Compare two sets of OpenStreetMap tags to identify differences, additions, deletions, and modifications. Performs detailed tag-level comparison showing which tags were added, removed, or changed between two versions. Provides human-readable names for all tags and values using the OSM tagging schema. Use this for reviewing tag changes, understanding feature modifications, analyzing tag history, or validating tag transformations. Returns structured diff with localized names for better readability.",
		parameters: {
			oldTags: {
				description:
					'The original/old set of tags to compare from. Accepts either JSON object format ({"amenity": "cafe"}) or flat text format (amenity=cafe\\nname=Old Name). This represents the "before" state in the comparison.',
				label: "Old Tags",
				instructions:
					'Supports two formats:\n1. JSON: {"amenity": "cafe", "name": "Old Name"}\n2. Flat text: amenity=cafe\\nname=Old Name',
			},
			newTags: {
				description:
					'The new/updated set of tags to compare to. Accepts either JSON object format ({"amenity": "restaurant"}) or flat text format (amenity=restaurant\\nname=New Name). This represents the "after" state in the comparison.',
				label: "New Tags",
				instructions:
					'Supports two formats:\n1. JSON: {"amenity": "restaurant", "name": "New Name"}\n2. Flat text: amenity=restaurant\\nname=New Name',
			},
			options: {
				description:
					"Options to control comparison output: 'showUnchanged' includes unchanged tags in the output (default: false), 'format' controls output format.",
				label: "Options",
			},
		},
	},

	flat_to_json: {
		name: "flat_to_json",
		description:
			"Convert OpenStreetMap tags from flat text format (key=value per line) to JSON object format. This is an INPUT CONVERTER for AI workflows - use it FIRST when you receive tags in flat text format and need to work with them as a JSON object. Handles various text formats including key=value pairs (one per line), whitespace variations, empty lines, and comments (lines starting with #). Returns a clean JSON object with all parsed tags. Essential for processing OSM data from text exports, iD editor output, or JOSM exports.",
		parameters: {
			flatText: {
				description:
					'Tags in flat text format with key=value pairs, one per line (e.g., "amenity=restaurant\\nname=Test Cafe\\ncuisine=italian"). Empty lines and lines starting with # are ignored. Whitespace around keys and values is trimmed automatically.',
				label: "Flat Text",
				instructions:
					"Example:\namenity=restaurant\nname=Test Cafe\ncuisine=italian\n# This is a comment\nopening_hours=Mo-Su 10:00-22:00",
			},
		},
	},

	json_to_flat: {
		name: "json_to_flat",
		description:
			"Convert OpenStreetMap tags from JSON object format to flat text format (key=value per line). This is an OUTPUT CONVERTER for AI workflows - use it LAST when you need to present tags in a human-readable text format or export them for use in other tools. Produces clean, consistent key=value format with one tag per line, sorted alphabetically by key. Use this for generating human-readable tag lists, exporting to OSM editors, or sharing tag collections. The output format is compatible with JOSM, iD editor imports, and other OSM tools that accept flat text tag format.",
		parameters: {
			jsonTags: {
				description:
					'Tags as a JSON object (e.g., {"amenity": "restaurant", "name": "Test Cafe", "cuisine": "italian"}). All values must be strings. The output will be formatted as key=value pairs, one per line, sorted alphabetically.',
				label: "JSON Tags",
				instructions:
					'Example: {"amenity": "restaurant", "name": "Test Cafe", "cuisine": "italian"}',
			},
		},
	},
};

/**
 * ============================================================================
 * PROMPTS METADATA
 * ============================================================================
 */

export interface PromptParameterMetadata {
	/** Parameter description shown to users */
	description: string;
	/** Optional detailed instructions or examples */
	instructions?: string;
	/** Optional label for UI display */
	label?: string;
}

export interface PromptMetadata {
	/** Prompt name (identifier) */
	name: string;
	/** Prompt description */
	description: string;
	/** Optional title for display */
	title?: string;
	/** Parameter metadata */
	parameters: Record<string, PromptParameterMetadata>;
}

/**
 * Prompt descriptions and parameter metadata
 */
export const promptsMetadata: Record<string, PromptMetadata> = {
	"validate-osm-feature": {
		name: "validate-osm-feature",
		description:
			"Guide the user through validating a complete OpenStreetMap feature. This prompt helps validate all tags for a feature, check for deprecated tags, and suggest improvements. Use when users want to validate data before uploading to OSM or check data quality.",
		title: "Validate OSM Feature",
		parameters: {
			featureType: {
				description:
					"Type of OSM feature to validate (e.g., 'restaurant', 'park', 'road', 'building'). Used to provide context for validation.",
				label: "Feature Type",
			},
			tags: {
				description:
					'Tags to validate in flat text format (key=value per line) or JSON. Example: "amenity=restaurant\\nname=Test Cafe\\ncuisine=italian"',
				label: "Tags",
				instructions: "Supports flat text or JSON format",
			},
		},
	},

	"find-preset": {
		name: "find-preset",
		description:
			"Help users find the correct OpenStreetMap preset for a feature they want to map. This prompt guides them through searching for presets, understanding the preset structure, and learning what tags and fields are needed. Use when users are learning OSM tagging or need to know how to tag a specific feature type.",
		title: "Find OSM Preset",
		parameters: {
			featureDescription: {
				description:
					"Description of the feature to find a preset for (e.g., 'Italian restaurant', 'public park', 'residential street', 'elementary school')",
				label: "Feature Description",
			},
		},
	},

	"learn-tag": {
		name: "learn-tag",
		description:
			"Provide comprehensive educational information about a specific OpenStreetMap tag key. This prompt explains what the tag is for, shows all possible values, and provides examples of proper usage. Use when users want to learn about OSM tagging concepts or understand a specific tag.",
		title: "Learn About OSM Tag",
		parameters: {
			tagKey: {
				description:
					"The OSM tag key to learn about (e.g., 'amenity', 'building', 'highway', 'natural', 'shop')",
				label: "Tag Key",
			},
		},
	},

	"improve-tags": {
		name: "improve-tags",
		description:
			"Guide users through improving an incomplete or minimal OpenStreetMap tag collection. This prompt analyzes existing tags, identifies the feature type, and suggests additional tags to make the feature more complete and useful. Use when users have basic tags but want to add more detail.",
		title: "Improve OSM Tags",
		parameters: {
			currentTags: {
				description:
					'Current tags for the feature in flat text format or JSON. Example: "amenity=restaurant\\nname=Test"',
				label: "Current Tags",
				instructions: "Supports flat text or JSON format",
			},
		},
	},

	"explore-category": {
		name: "explore-category",
		description:
			"Help users explore all feature types within an OpenStreetMap category. This prompt shows all available values for a tag key, finds related presets, and helps users understand the breadth of features in a category. Use when users want to learn what can be mapped in a specific category or discover all options.",
		title: "Explore OSM Category",
		parameters: {
			category: {
				description:
					"OSM category/tag key to explore (e.g., 'amenity', 'shop', 'highway', 'natural', 'building', 'landuse')",
				label: "Category",
			},
			geometryType: {
				description:
					"Optional: filter to only features of this geometry type (point, line, area, relation)",
				label: "Geometry Type",
			},
		},
	},
};

/**
 * ============================================================================
 * RESOURCES METADATA
 * ============================================================================
 *
 * Resources are static or semi-static content that the MCP server can provide.
 * They are ideal for:
 * - Documentation
 * - Configuration files
 * - Reference data
 * - Static datasets
 *
 * Resources can be:
 * - Listed (resources/list)
 * - Read (resources/read)
 * - Subscribed to for updates (if server supports it)
 */

export interface ResourceMetadata {
	/** Resource URI (unique identifier) */
	uri: string;
	/** Resource name */
	name: string;
	/** Resource description */
	description: string;
	/** MIME type of the resource */
	mimeType?: string;
}

/**
 * Resource definitions
 *
 * TODO: Implement actual resources when needed
 * Example resources could include:
 * - OSM tagging schema documentation
 * - Common tagging patterns guide
 * - Deprecated tags reference
 * - Field type documentation
 */
export const resourcesMetadata: Record<string, ResourceMetadata> = {
	// Empty for now - will be populated when resources are implemented
};

/**
 * ============================================================================
 * MCP SDK 1.25 CAPABILITIES METADATA
 * ============================================================================
 *
 * The following sections define metadata structures for MCP SDK 1.25 capabilities
 * that are not yet implemented but are available in the protocol.
 */

/**
 * SAMPLING
 *
 * Sampling allows servers to request LLM completions from the client.
 * This is a CLIENT-SIDE capability - the server requests, the client provides.
 *
 * Use cases:
 * - Server needs AI assistance to process data
 * - Generate suggestions based on context
 * - Classify or analyze user input
 *
 * The client maintains control over:
 * - Which model to use
 * - Access permissions
 * - Rate limiting
 * - Cost management
 *
 * TODO: Implement sampling requests when needed
 */
export interface SamplingMetadata {
	/** Whether to include context in sampling requests */
	includeContext?: "none" | "thisServer" | "allServers";
	/** Whether to enable tool use in sampling */
	enableTools?: boolean;
}

export const samplingMetadata: Record<string, SamplingMetadata> = {
	// Empty for now - will be populated when sampling is implemented
};

/**
 * ELICITATION
 *
 * Elicitation allows servers to request additional information from users.
 * This is a CLIENT-SIDE capability - the server requests, the client provides.
 *
 * Two types:
 * 1. Form elicitation - Structured forms with validation
 * 2. URL elicitation - Redirect user to URL for input
 *
 * Use cases:
 * - Request missing configuration
 * - Ask for user preferences
 * - OAuth/authentication flows (URL elicitation)
 * - Gather structured input with validation
 *
 * TODO: Implement elicitation when interactive features are needed
 */
export interface ElicitationMetadata {
	/** Elicitation type */
	type: "form" | "url";
	/** Form schema (for form type) */
	schema?: z.ZodObject<any>;
	/** URL (for URL type) */
	url?: string;
	/** Title shown to user */
	title?: string;
	/** Description/instructions */
	description?: string;
}

export const elicitationMetadata: Record<string, ElicitationMetadata> = {
	// Empty for now - will be populated when elicitation is implemented
};

/**
 * ROOTS
 *
 * Roots are filesystem boundaries exposed by the CLIENT.
 * This is a CLIENT-SIDE capability - not something servers implement.
 *
 * Roots allow clients to:
 * - Expose specific directories to servers
 * - Set filesystem boundaries
 * - Control file access permissions
 *
 * Servers can:
 * - List available roots (roots/list)
 * - Request files within root boundaries
 *
 * Note: This metadata is informational only since roots are client-side.
 * Servers may use this information to understand available filesystem access.
 *
 * TODO: Document how to work with roots when implementing file-based features
 */
export interface RootsMetadata {
	/** Root URI */
	uri: string;
	/** Root name/label */
	name: string;
	/** Optional description */
	description?: string;
}

export const rootsMetadata: Record<string, RootsMetadata> = {
	// Empty for now - informational only, roots are client-side
};

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get tool metadata by name
 */
export function getToolMetadata(toolName: string): ToolMetadata | undefined {
	return toolsMetadata[toolName];
}

/**
 * Get prompt metadata by name
 */
export function getPromptMetadata(promptName: string): PromptMetadata | undefined {
	return promptsMetadata[promptName];
}

/**
 * Get resource metadata by URI
 */
export function getResourceMetadata(uri: string): ResourceMetadata | undefined {
	return resourcesMetadata[uri];
}

/**
 * List all available tool names
 */
export function listToolNames(): string[] {
	return Object.keys(toolsMetadata);
}

/**
 * List all available prompt names
 */
export function listPromptNames(): string[] {
	return Object.keys(promptsMetadata);
}

/**
 * List all available resource URIs
 */
export function listResourceUris(): string[] {
	return Object.keys(resourcesMetadata);
}
