/**
 * OpenStreetMap Tagging Schema - Unified Data Types
 *
 * This module exports types for the unified OSM tagging schema data format.
 *
 * Current usage:
 * - Types are used by SchemaLoader to load data from @openstreetmap/id-tagging-schema
 * - SchemaLoader transforms raw JSON into SchemaData format
 *
 * Future usage:
 * - @gander-schemas/osm-tagging-schema will provide pre-processed SchemaData
 * - Data will be imported directly without transformation
 * - Multiple data sources can be merged into unified SchemaData
 *
 * @example
 * // Current: Load from @openstreetmap/id-tagging-schema
 * import { SchemaLoader } from './utils/schema-loader.js';
 * const schema: SchemaData = await schemaLoader.loadSchema();
 *
 * @example
 * // Future: Direct import from @gander-schemas/osm-tagging-schema
 * import schemaData from '@gander-schemas/osm-tagging-schema/data.json' with { type: 'json' };
 * const schema: SchemaData = schemaData;
 */

// Export all schema data types
export type {
	DeprecatedTag,
	EnglishTranslations,
	// Schema entities
	Field,
	FieldType,
	// Core types
	GeometryType,
	LocationSet,
	Preset,
	PresetCategory,
	// Defaults
	PresetDefaults,
	// Complete schema
	SchemaData,
	// Metadata
	SchemaMetadata,
	// Indexing
	TagIndex,
	TranslationCategory,
	TranslationField,
	// Translations
	TranslationFieldOption,
	TranslationPreset,
	Translations,
} from "./types.js";
