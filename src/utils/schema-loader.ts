import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import packageJsonRaw from "@openstreetmap/id-tagging-schema/package.json" with { type: "json" };
import type {
	DeprecatedTag,
	Field,
	GeometryType,
	Preset,
	PresetCategory,
	PresetDefaults,
	SchemaData,
	SchemaLoaderConfig,
	SchemaMetadata,
	TagIndex,
	Translations,
} from "../types";
import { logger } from "./logger.js";

/**
 * Schema loader for OpenStreetMap tagging schema
 * Handles loading, caching, and indexing of schema data
 * Optimized version: Always builds indexes, single-pass loading
 */
export class SchemaLoader {
	private cacheTTL: number;
	private cache: SchemaData | null = null;
	private cacheTimestamp: number = 0;
	private index: TagIndex | null = null;
	private schemaBasePath: string;

	constructor(config: SchemaLoaderConfig = {}) {
		this.cacheTTL = config.cacheTTL ?? Number.POSITIVE_INFINITY;

		// Resolve path to @openstreetmap/id-tagging-schema/dist using Node.js module resolution
		// This works with both nested and flat node_modules structures
		try {
			// Use import.meta.resolve to find the package (Node.js 20.6+)
			const packageJsonUrl = import.meta.resolve("@openstreetmap/id-tagging-schema/package.json");
			const packageJsonPath = fileURLToPath(packageJsonUrl);
			this.schemaBasePath = join(dirname(packageJsonPath), "dist");
		} catch (_error) {
			// Fallback to relative path for development/testing
			const __filename = fileURLToPath(import.meta.url);
			const __dirname = dirname(__filename);
			this.schemaBasePath = join(
				__dirname,
				"../../node_modules/@openstreetmap/id-tagging-schema/dist",
			);
		}
	}

	/**
	 * Load schema data from the id-tagging-schema package
	 * Optimized: Builds indexes during load in a single pass
	 * Includes version tracking and graceful error handling
	 */
	async loadSchema(): Promise<SchemaData> {
		// Check cache validity
		if (this.cache && this.isCacheValid()) {
			return this.cache;
		}

		try {
			// Load schema version first
			const metadata = await this.loadSchemaMetadata();

			// Log schema version
			logger.info(`Loading OSM tagging schema v${metadata.version}`, "SchemaLoader");

			// Load all schema files in parallel
			const [presets, fields, categories, deprecated, defaults, translations] = await Promise.all([
				this.loadJSON<Record<string, Preset>>("presets.json"),
				this.loadJSON<Record<string, Field>>("fields.json"),
				this.loadJSON<Record<string, PresetCategory>>("preset_categories.json"),
				this.loadJSON<DeprecatedTag[]>("deprecated.json"),
				this.loadJSON<Record<string, PresetDefaults>>("preset_defaults.json"),
				this.loadJSON<Translations>("translations/en.json"),
			]);

			// Validate schema structure
			this.validateSchemaStructure({
				presets,
				fields,
				categories,
				deprecated,
				defaults,
			});

			this.cache = {
				presets,
				fields,
				categories,
				deprecated,
				defaults,
				translations,
				metadata,
			};

			this.cacheTimestamp = Date.now();

			// Always build index during load (optimized: single pass)
			this.buildIndex();

			logger.info(
				`Schema v${metadata.version} loaded successfully (${Object.keys(presets).length} presets, ${Object.keys(fields).length} fields)`,
				"SchemaLoader",
			);

			return this.cache;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				`Failed to load schema: ${errorMessage}`,
				"SchemaLoader",
				error instanceof Error ? error : undefined,
			);

			// Wrap error with descriptive message
			throw new Error(`Failed to load schema from ${this.schemaBasePath}: ${errorMessage}`);
		}
	}

	/**
	 * Warmup method to preload schema and build indexes
	 * Call this at server startup to eliminate initial latency
	 */
	async warmup(): Promise<void> {
		await this.loadSchema();
	}

	/**
	 * Clear cached schema data
	 */
	clearCache(): void {
		this.cache = null;
		this.cacheTimestamp = 0;
		this.index = null;
	}

	/**
	 * Get the tag index
	 * Index is always built during schema load
	 */
	getIndex(): TagIndex {
		if (!this.index) {
			throw new Error("Schema not loaded. Call loadSchema() or warmup() first.");
		}
		return this.index;
	}

	/**
	 * Find field by OSM tag key using the index
	 * Optimized O(1) lookup using byFieldKey index
	 */
	findFieldByKey(key: string): Field | undefined {
		if (!this.index) {
			throw new Error("Schema not loaded. Call loadSchema() or warmup() first.");
		}
		return this.index.byFieldKey.get(key);
	}

	/**
	 * Find presets by tag key
	 */
	findPresetsByKey(key: string): Preset[] {
		if (!this.index) {
			throw new Error("Schema not loaded. Call loadSchema() or warmup() first.");
		}

		const presetIds = this.index.byKey.get(key);
		if (!presetIds || !this.cache) {
			return [];
		}

		return Array.from(presetIds)
			.map((id) => this.cache?.presets[id])
			.filter((preset) => preset !== undefined);
	}

	/**
	 * Find presets by tag key-value pair
	 */
	findPresetsByTag(key: string, value: string): Preset[] {
		if (!this.index) {
			throw new Error("Schema not loaded. Call loadSchema() or warmup() first.");
		}

		const tagKey = `${key}=${value}`;
		const presetIds = this.index.byTag.get(tagKey);
		if (!presetIds || !this.cache) {
			return [];
		}

		return Array.from(presetIds)
			.map((id) => this.cache?.presets[id])
			.filter((preset) => preset !== undefined);
	}

	/**
	 * Find presets by geometry type
	 */
	findPresetsByGeometry(geometry: GeometryType): Preset[] {
		if (!this.index) {
			throw new Error("Schema not loaded. Call loadSchema() or warmup() first.");
		}

		const presetIds = this.index.byGeometry.get(geometry);
		if (!presetIds || !this.cache) {
			return [];
		}

		return Array.from(presetIds)
			.map((id) => this.cache?.presets[id])
			.filter((preset) => preset !== undefined);
	}

	/**
	 * Get field by key
	 */
	getField(key: string): Field | undefined {
		if (!this.cache) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}
		return this.cache.fields[key];
	}

	/**
	 * Get all deprecated tags
	 */
	getDeprecated(): DeprecatedTag[] {
		if (!this.cache) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}
		return this.cache.deprecated;
	}

	/**
	 * Get the loaded schema version
	 * Returns the version of @openstreetmap/id-tagging-schema package
	 */
	getSchemaVersion(): string {
		if (!this.cache?.metadata) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}
		return this.cache.metadata.version;
	}

	/**
	 * Get the localized name for a preset
	 * @param presetId - The preset ID (e.g., "amenity/restaurant")
	 * @returns The localized name or a formatted fallback name
	 */
	getPresetName(presetId: string): string {
		if (!this.cache?.translations) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		const translation = this.cache.translations.en.presets.presets[presetId];
		if (translation?.name) {
			return translation.name;
		}

		// Fallback: format the preset ID (ucfirst + replace _ with spaces)
		// For "amenity/restaurant" → take the value part after "/"
		const parts = presetId.split("/");
		const valuePart = parts.length > 1 ? parts[parts.length - 1] : presetId;
		return this.formatFallbackName(valuePart || presetId);
	}

	/**
	 * Get the localized label for a field
	 * @param fieldKey - The field key (e.g., "parking", "amenity")
	 * @returns The localized label or a formatted fallback name
	 */
	getFieldLabel(fieldKey: string): string {
		if (!this.cache?.translations) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		const translation = this.cache.translations.en.presets.fields[fieldKey];
		if (translation?.label) {
			return translation.label;
		}

		// Fallback: format the field key (ucfirst + replace _ with spaces)
		return this.formatFallbackName(fieldKey);
	}

	/**
	 * Get the localized name for a field option (value)
	 * @param fieldKey - The field key (e.g., "parking")
	 * @param optionValue - The option value (e.g., "surface", "underground")
	 * @returns The title and optional description, with formatted fallback
	 */
	getFieldOptionName(
		fieldKey: string,
		optionValue: string,
	): { title: string; description?: string } {
		if (!this.cache?.translations) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		const fieldTranslation = this.cache.translations.en.presets.fields[fieldKey];
		const option = fieldTranslation?.options?.[optionValue];

		if (option) {
			// Options can be either strings or objects with title/description
			if (typeof option === "string") {
				return { title: option };
			}
			return option;
		}

		// Fallback: format the option value (ucfirst + replace _ with spaces)
		return { title: this.formatFallbackName(optionValue) };
	}

	/**
	 * Get the localized name for a category
	 * @param categoryId - The category ID (e.g., "category-building")
	 * @returns The localized name or a formatted fallback name
	 */
	getCategoryName(categoryId: string): string {
		if (!this.cache?.translations) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		const translation = this.cache.translations.en.presets.categories[categoryId];
		if (translation?.name) {
			return translation.name;
		}

		// Fallback: format the category ID (ucfirst + replace _ with spaces)
		// Remove "category-" prefix if present
		const cleanId = categoryId.replace(/^category-/, "");
		return this.formatFallbackName(cleanId);
	}

	/**
	 * Get the display name for a tag key (NOT field label!)
	 *
	 * IMPORTANT: This method does NOT use field labels from fields.json.
	 * Field labels are UI strings for form fields, not tag key names.
	 *
	 * Algorithm:
	 * - Replace underscores with spaces
	 * - Apply title case (capitalize first letter of each word)
	 *
	 * Examples:
	 * - "parking" → "Parking"
	 * - "parking_space" → "Parking Space"
	 * - "street_side" → "Street Side"
	 *
	 * @param tagKey - The OSM tag key (e.g., "parking", "parking_space")
	 * @returns The formatted display name for the tag key
	 */
	getTagKeyName(tagKey: string): string {
		if (!this.cache) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		// Handle empty or undefined input
		if (!tagKey || tagKey.length === 0) {
			return "";
		}

		// Replace underscores with spaces
		const withSpaces = tagKey.replace(/_/g, " ");

		// Title case - uppercase first letter of each word
		return withSpaces
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	/**
	 * Get the display name for a tag value
	 *
	 * Algorithm:
	 * 1. Try to find a preset with ID "{key}/{value}" (e.g., "amenity/parking")
	 * 2. If found, return the preset's localized name (e.g., "Parking Lot")
	 * 3. If not found, try field options from fields.json
	 * 4. If not found, apply title case formatting to the value
	 *
	 * Examples:
	 * - getTagValueName("amenity", "parking") → "Parking Lot" (from preset amenity/parking)
	 * - getTagValueName("parking", "surface") → "Surface" (from field options or title case)
	 *
	 * @param key - The OSM tag key (e.g., "amenity")
	 * @param value - The OSM tag value (e.g., "parking")
	 * @returns The display name for the tag value
	 */
	getTagValueName(key: string, value: string): string {
		if (!this.cache) {
			throw new Error("Schema not loaded. Call loadSchema() first.");
		}

		// Handle empty input
		if (!key || key.length === 0 || !value || value.length === 0) {
			return "";
		}

		// Try to find preset with ID "{key}/{value}"
		const presetId = `${key}/${value}`;
		if (this.cache.presets[presetId]) {
			return this.getPresetName(presetId);
		}

		// Fallback to field options
		const fieldKeyLookup = key.replace(/:/g, "/");
		const fieldOption = this.getFieldOptionName(fieldKeyLookup, value);
		if (fieldOption.title !== this.formatFallbackName(value)) {
			// Field option exists and is not just formatted fallback
			return fieldOption.title;
		}

		// Final fallback: title case formatting
		return this.formatFallbackName(value);
	}

	/**
	 * Generate a human-readable fallback name from a key/ID
	 * Applies: uppercase first letter + replace underscores with spaces
	 * @param key - The key or ID to format (e.g., "fast_food", "amenity/restaurant")
	 * @returns Formatted name (e.g., "Fast food", "Amenity/restaurant")
	 */
	private formatFallbackName(key: string): string {
		// Replace underscores with spaces
		const withSpaces = key.replace(/_/g, " ");

		// Uppercase first letter
		if (withSpaces.length === 0) {
			return withSpaces;
		}

		return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
	}

	/**
	 * Load JSON file from schema package
	 */
	private async loadJSON<T>(filename: string): Promise<T> {
		const filePath = join(this.schemaBasePath, filename);
		const content = await readFile(filePath, "utf-8");
		return JSON.parse(content) as T;
	}

	/**
	 * Check if cache is still valid
	 */
	private isCacheValid(): boolean {
		if (this.cacheTTL === Number.POSITIVE_INFINITY) {
			return true;
		}
		const age = Date.now() - this.cacheTimestamp;
		return age < this.cacheTTL;
	}

	/**
	 * Build index for fast lookups
	 * Optimized: Single pass through data, builds all indexes at once
	 */
	private buildIndex(): void {
		if (!this.cache) {
			throw new Error("Cannot build index without loaded schema");
		}

		this.index = {
			byKey: new Map(),
			byTag: new Map(),
			byGeometry: new Map(),
			byFieldKey: new Map(),
		};

		// Index all fields by OSM tag key
		for (const field of Object.values(this.cache.fields)) {
			// Index by the actual OSM tag key (field.key)
			if (field.key) {
				this.index.byFieldKey.set(field.key, field);
			}
		}

		// Index all presets
		for (const [presetId, preset] of Object.entries(this.cache.presets)) {
			// Index by tag keys
			for (const key of Object.keys(preset.tags)) {
				if (!this.index.byKey.has(key)) {
					this.index.byKey.set(key, new Set());
				}
				this.index.byKey.get(key)?.add(presetId);
			}

			// Index by full tags (key=value)
			for (const [key, value] of Object.entries(preset.tags)) {
				// Skip wildcard values
				if (value === "*") continue;

				const tagKey = `${key}=${value}`;
				if (!this.index.byTag.has(tagKey)) {
					this.index.byTag.set(tagKey, new Set());
				}
				this.index.byTag.get(tagKey)?.add(presetId);
			}

			// Index by geometry
			for (const geometry of preset.geometry) {
				if (!this.index.byGeometry.has(geometry)) {
					this.index.byGeometry.set(geometry, new Set());
				}
				this.index.byGeometry.get(geometry)?.add(presetId);
			}
		}
	}

	/**
	 * Load schema metadata including version information
	 */
	private async loadSchemaMetadata(): Promise<SchemaMetadata> {
		try {
			// Use imported package.json from schema package
			const packageJson = packageJsonRaw as unknown as { version: string };

			return {
				version: packageJson.version,
				loadedAt: Date.now(),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to load schema metadata: ${errorMessage}`);
		}
	}

	/**
	 * Validate schema structure to detect breaking changes
	 */
	private validateSchemaStructure(data: Omit<SchemaData, "metadata">): void {
		// Validate presets
		if (!data.presets || typeof data.presets !== "object") {
			throw new Error("Invalid schema: presets must be an object");
		}
		if (Object.keys(data.presets).length === 0) {
			throw new Error("Invalid schema: presets cannot be empty");
		}

		// Validate fields
		if (!data.fields || typeof data.fields !== "object") {
			throw new Error("Invalid schema: fields must be an object");
		}
		if (Object.keys(data.fields).length === 0) {
			throw new Error("Invalid schema: fields cannot be empty");
		}

		// Validate categories
		if (!data.categories || typeof data.categories !== "object") {
			throw new Error("Invalid schema: categories must be an object");
		}

		// Validate deprecated
		if (!Array.isArray(data.deprecated)) {
			throw new Error("Invalid schema: deprecated must be an array");
		}

		// Validate defaults
		if (!data.defaults || typeof data.defaults !== "object") {
			throw new Error("Invalid schema: defaults must be an object");
		}

		// Validate preset structure (spot check first preset)
		const presetKeys = Object.keys(data.presets);
		if (presetKeys.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: Safe - array length > 0
			const firstPresetKey = presetKeys[0]!;
			const firstPreset = data.presets[firstPresetKey];
			if (!firstPreset) {
				throw new Error(`Invalid schema: preset '${firstPresetKey}' is undefined`);
			}
			if (!Array.isArray(firstPreset.geometry)) {
				throw new Error(`Invalid schema: preset '${firstPresetKey}' missing geometry array`);
			}
			if (!firstPreset.tags || typeof firstPreset.tags !== "object") {
				throw new Error(`Invalid schema: preset '${firstPresetKey}' missing tags object`);
			}
		}

		// Validate field structure (spot check first field)
		const fieldKeys = Object.keys(data.fields);
		if (fieldKeys.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: Safe - array length > 0
			const firstFieldKey = fieldKeys[0]!;
			const firstField = data.fields[firstFieldKey];
			if (!firstField) {
				throw new Error(`Invalid schema: field '${firstFieldKey}' is undefined`);
			}
			if (!firstField.key) {
				throw new Error(`Invalid schema: field '${firstFieldKey}' missing key property`);
			}
			if (!firstField.type) {
				throw new Error(`Invalid schema: field '${firstFieldKey}' missing type property`);
			}
		}

		logger.debug("Schema structure validation passed", "SchemaLoader");
	}
}

/**
 * Singleton instance of SchemaLoader
 * This instance is shared across all tool modules
 */
export const schemaLoader = new SchemaLoader();
