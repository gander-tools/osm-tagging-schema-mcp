/**
 * Type definitions for OpenStreetMap tagging schema data structures
 *
 * These types represent the unified data format for OSM tagging schema.
 * In the future, these will be imported from @gander-schemas/osm-tagging-schema
 * which will provide pre-processed and optimized schema data.
 *
 * Data sources (currently from @openstreetmap/id-tagging-schema):
 * - presets.json: Feature presets with tags, geometry, fields
 * - fields.json: Tag field definitions (types, options, validation)
 * - preset_categories.json: Category membership
 * - deprecated.json: Deprecated tag mappings
 * - preset_defaults.json: Default presets per geometry
 * - translations/en.json: Localized strings
 */

/**
 * Geometry types supported by OSM presets
 */
export type GeometryType = "point" | "vertex" | "line" | "area" | "relation";

/**
 * Field types available in the schema
 */
export type FieldType =
	| "check"
	| "combo"
	| "typeCombo"
	| "multiCombo"
	| "semiCombo"
	| "text"
	| "textarea"
	| "number"
	| "radio"
	| "url"
	| "identifier"
	| "email"
	| "tel"
	| "wikipedia"
	| "wikidata"
	| "address"
	| "manyCombo"
	| "networkCombo"
	| "roadheight"
	| "roadspeed";

/**
 * Location set for geographic restrictions
 */
export interface LocationSet {
	include?: string[];
	exclude?: string[];
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
	prerequisiteTag?: { key: string; value?: string; valueNot?: string };
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
 * Preset defaults per geometry type
 */
export interface PresetDefaults {
	area?: string[];
	line?: string[];
	point?: string[];
}

/**
 * Complete schema data structure
 *
 * This is the unified format that will be used for:
 * 1. Current: Data loaded from @openstreetmap/id-tagging-schema
 * 2. Future: Pre-processed data from @gander-schemas/osm-tagging-schema
 */
export interface SchemaData {
	presets: Record<string, Preset>;
	fields: Record<string, Field>;
	categories: Record<string, PresetCategory>;
	deprecated: DeprecatedTag[];
	defaults: Record<string, PresetDefaults>;
	translations?: Translations; // Localized strings (e.g., en.json)
	metadata?: SchemaMetadata; // Schema version and load metadata
}

/**
 * Index for fast tag lookups
 *
 * This index is built at runtime for efficient queries.
 * In the future, @gander-schemas/osm-tagging-schema may provide
 * pre-built indexes as part of the optimized data package.
 */
export interface TagIndex {
	byKey: Map<string, Set<string>>; // key -> Set of preset IDs
	byTag: Map<string, Set<string>>; // "key=value" -> Set of preset IDs
	byGeometry: Map<GeometryType, Set<string>>; // geometry -> Set of preset IDs
	byFieldKey: Map<string, Field>; // OSM tag key -> Field definition
}
