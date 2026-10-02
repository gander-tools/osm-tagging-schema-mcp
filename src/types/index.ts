/**
 * Type definitions for OpenStreetMap tagging schema structures
 */

import type { Field as SchemaField } from "@openstreetmap/id-tagging-schema/dist/fields.d.json.ts";

/**
 * Geometry types supported by OSM presets
 */
export type GeometryType = "point" | "vertex" | "line" | "area" | "relation";

/**
 * Field types available in the schema (derived from the schema package, so it follows upgrades)
 */
export type FieldType = SchemaField["type"];

/**
 * Location set for geographic restrictions
 */
export interface LocationSet {
	include?: string[];
	exclude?: string[];
}

/**
 * Condition under which a field is shown (v7 also allows an array of conditions)
 */
export interface PrerequisiteTag {
	key: string;
	value?: string;
	valueNot?: string;
}

/**
 * Field definition in the schema
 */
export interface Field {
	key: string;
	keys?: string[];
	type: FieldType;
	label?: string;
	placeholder?: string;
	universal?: boolean;
	geometry?: GeometryType[];
	default?: string | number | boolean;
	options?: string[];
	strings?: Record<string, { title: string; description?: string }>;
	minValue?: number;
	maxValue?: number;
	locationSet?: LocationSet;
	urlFormat?: string;
	pattern?: string;
	reference?: { key: string; value?: string };
	prerequisiteTag?: PrerequisiteTag | PrerequisiteTag[];
	terms?: string[];
}

/**
 * Preset definition in the schema
 */
export interface Preset {
	name?: string;
	icon?: string;
	imageURL?: string;
	geometry: GeometryType[];
	tags: Record<string, string>;
	addTags?: Record<string, string>;
	removeTags?: Record<string, string>;
	fields?: string[];
	moreFields?: string[];
	terms?: string[];
	searchable?: boolean;
	matchScore?: number;
	reference?: { key: string; value?: string };
	locationSet?: LocationSet;
}

/**
 * Preset category in the schema
 */
export interface PresetCategory {
	icon?: string;
	geometry: GeometryType[];
	members: string[];
}

/**
 * Deprecated tag mapping
 */
export interface DeprecatedTag {
	old: Record<string, string>;
	replace: Record<string, string>;
}

/**
 * Schema metadata for version tracking and update detection
 */
export interface SchemaMetadata {
	version: string; // Package version (e.g., "6.13.4")
	loadedAt: number; // Timestamp when schema was loaded
}

/**
 * Translation structure for a field option (value)
 */
export interface TranslationFieldOption {
	title: string;
	description?: string;
}

/**
 * Translation structure for a field
 */
export interface TranslationField {
	label?: string;
	options?: Record<string, string | TranslationFieldOption>;
}

/**
 * Translation structure for a preset
 */
export interface TranslationPreset {
	name: string;
	terms?: string;
}

/**
 * Translation structure for a category
 */
export interface TranslationCategory {
	name: string;
}

/**
 * Complete English translation data structure
 */
export interface EnglishTranslations {
	presets: {
		categories: Record<string, TranslationCategory>;
		fields: Record<string, TranslationField>;
		presets: Record<string, TranslationPreset>;
	};
}

/**
 * Translation data structure (multi-language support)
 */
export interface Translations {
	en: EnglishTranslations;
}

/**
 * Complete schema data structure
 */
export interface SchemaData {
	presets: Record<string, Preset>;
	fields: Record<string, Field>;
	categories: Record<string, PresetCategory>;
	deprecated: DeprecatedTag[];
	defaults: Record<string, { area?: string[]; line?: string[]; point?: string[] }>;
	translations?: Translations; // Localized strings (e.g., en.json)
	metadata?: SchemaMetadata; // Schema version and load metadata
}

/**
 * Index for fast tag lookups
 */
export interface TagIndex {
	byKey: Map<string, Set<string>>; // key -> Set of preset IDs
	byTag: Map<string, Set<string>>; // "key=value" -> Set of preset IDs
	byGeometry: Map<GeometryType, Set<string>>; // geometry -> Set of preset IDs
	byFieldKey: Map<string, Field>; // OSM tag key -> Field definition
}

/**
 * Schema loader configuration
 */
export interface SchemaLoaderConfig {
	cacheTTL?: number; // Cache time-to-live in milliseconds (default: infinite)
	// Note: Indexing is always enabled for optimal performance
}

/**
 * Validation result for a tag
 */
export interface TagValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
	deprecated?: {
		old: Record<string, string>;
		replacement: Record<string, string>;
	};
}

/**
 * Tag collection validation result
 */
export interface TagCollectionValidationResult {
	valid: boolean;
	tags: Record<string, TagValidationResult>;
	suggestions: string[];
}

/**
 * Tool definition types for MCP SDK migration
 */
export type {
	OsmToolDefinition,
	ToolAnnotations,
	ToolCallback,
	ToolConfig,
} from "./tool-definition.js";
