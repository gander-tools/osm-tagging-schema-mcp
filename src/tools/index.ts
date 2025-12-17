/**
 * Tool registry - exports all tools as OsmToolDefinition array
 */

import type { OsmToolDefinition } from "../types/index.js";
import CompareTags from "./compare-tags.js";
import FlatToJson from "./flat-to-json.js";
import GetPresetDetails from "./get-preset-details.js";
import GetTagValues from "./get-tag-values.js";
import JsonToFlat from "./json-to-flat.js";
import SearchPresets from "./search-presets.js";
import SearchTags from "./search-tags.js";
import SuggestImprovements from "./suggest-improvements.js";
import ValidateTag from "./validate-tag.js";
import ValidateTagCollection from "./validate-tag-collection.js";

/**
 * All available tools using new OsmToolDefinition interface
 * Sorted alphabetically by name for consistent ordering
 */
// biome-ignore lint/suspicious/noExplicitAny: Heterogeneous array of tools with different input schemas
export const tools: OsmToolDefinition<any>[] = [
	CompareTags,
	FlatToJson,
	GetPresetDetails,
	GetTagValues,
	JsonToFlat,
	SearchPresets,
	SearchTags,
	SuggestImprovements,
	ValidateTag,
	ValidateTagCollection,
];
