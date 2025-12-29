/**
 * Type definitions for OpenStreetMap tagging schema MCP server
 *
 * This module re-exports schema data types from lib/osm-tagging-schema
 * and adds MCP server-specific types (validation results, loader config).
 *
 * Schema data types (from lib/osm-tagging-schema):
 * - GeometryType, FieldType, LocationSet
 * - Field, Preset, PresetCategory, DeprecatedTag
 * - SchemaMetadata, Translations, SchemaData, TagIndex
 *
 * MCP server types (defined here):
 * - SchemaLoaderConfig - configuration for schema loader
 * - TagValidationResult - single tag validation result
 * - TagCollectionValidationResult - collection validation result
 * - Tool definition types (from ./tool-definition.ts)
 */

// Re-export all schema data types from lib
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
} from "../../lib/osm-tagging-schema/index.js";

/**
 * Schema loader configuration
 *
 * This is MCP server-specific configuration, not part of schema data.
 */
export interface SchemaLoaderConfig {
	cacheTTL?: number; // Cache time-to-live in milliseconds (default: infinite)
	// Note: Indexing is always enabled for optimal performance
}

/**
 * Validation result for a tag
 *
 * This is MCP server-specific, used by validation tools.
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
 *
 * This is MCP server-specific, used by validation tools.
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
