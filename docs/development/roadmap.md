# Development Roadmap

## TL;DR

**Current Status:** ✅ Production Ready (Phase 8 Complete)

**What's Done:**
- ✅ 7 fully functional MCP tools for OSM tagging (query, presets, validation)
- ✅ **Phase 8 Complete**: Full localization support with human-readable names for all tools
- ✅ Template system for field expansion in presets (removed after the move to `id-tagging-schema` v7, which resolves references at build time)
- ✅ Comprehensive testing: full test suite with 100% pass rate, JSON data integrity validation
- ✅ Multiple deployment options: npx, Docker, source installation
- ✅ Security: npm provenance (SLSA Level 3), Docker image signing, SBOM generation
- ✅ Transport protocols: stdio (default), HTTP/SSE for web clients
- ✅ Complete documentation: installation, configuration, usage, API reference, troubleshooting

**What's Next (Phase 9):**
- Advanced validation features (geometry constraints, field inheritance, prerequisite validation)
- Conditional field analysis
- Tag quality scoring
- No new tools planned - focus on enhancing existing 7 tools

**Quick Links:**
- [Installation](../user/installation.md) - Get started in 2 minutes with npx
- [API Reference](../api/README.md) - Explore all tools
- [Contributing](contributing.md) - Join the project

---

## Development Phases

### Phase 1: Project Setup ✅

**Status:** Complete

**Achievements:**
- TypeScript 5.9 project with Node.js 24+
- MCP SDK and OSM tagging schema integration
- BiomeJS for code quality
- Node.js native test runner
- GitHub Actions CI/CD pipeline

### Phase 2: Schema Integration ✅

**Status:** Complete

**Achievements:**
- Schema loader with caching and indexing
- Type definitions for schema structures
- Fast lookup system (byKey, byTag, byGeometry, byFieldKey)
- Full unit test suite passing
- Integration tests for MCP server

### Phase 3: Core Tool Implementation ✅

**Status:** Complete - 7 Tools Implemented

**Tag Query Tools (2 tools):**
- ✅ `get_tag_values` - Get all possible values for a tag key with descriptions
- ✅ `search_tags` - Search for tags by keyword in keys and values

**Preset Discovery Tools (2 tools):**
- ✅ `search_presets` - Search presets by keyword/tag with geometry filtering
- ✅ `get_preset_details` - Get complete preset configuration (tags, geometry, fields)

**Validation Tools (3 tools):**
- ✅ `validate_tag` - Validate single tag (includes deprecation checking)
- ✅ `validate_tag_collection` - Validate tag collections with statistics
- ✅ `suggest_improvements` - Suggest improvements for tag collections

**Design Philosophy:**
- Optimized set with no redundancy - 7 additional tools considered but deemed redundant
- Removed tools: `get_tag_info`, `get_related_tags`, `get_preset_tags`, `get_categories`, `get_category_tags`, `get_schema_stats`
- `check_deprecated` merged into `validate_tag` for cleaner API
- Current 7 tools provide complete functionality without duplication

### Phase 4: Testing ✅

**Status:** Complete

**Achievements:**
- Comprehensive test suite (unit + integration)
- 100% pass rate
- JSON Data Integrity Tests against source schema data
- Complete coverage: all tag keys and presets validated
- Bidirectional validation for complete data integrity
- Modular test structure (one file per tool)
- Shared test utilities and helpers

### Phase 5: Documentation ✅

**Status:** Complete

**User Documentation:**
- ✅ Installation guide (npx, Docker, source)
- ✅ Configuration guide (Claude Code/Desktop, custom clients)
- ✅ Usage guide (examples, workflows, best practices)
- ✅ Complete API reference for all 7 tools
- ✅ Troubleshooting guide
- ✅ Deployment guide (Docker)
- ✅ Security documentation (provenance, SLSA, SBOM)

**Developer Documentation:**
- ✅ Contribution guidelines with TDD workflow
- ✅ Development guide with setup and debugging
- ✅ Development roadmap (this file)
- ✅ Changelog with version history
- ✅ Technical implementation notes

### Phase 6: Optimization & Polish ✅

**Status:** Complete

**Schema Optimization:**
- ✅ Always-on indexing (removed optional indexing)
- ✅ Schema preloading at server startup (warmup method)
- ✅ Field key index for O(1) lookups
- ✅ Single-pass indexing during schema load

**Logging & Debugging:**
- ✅ Configurable log levels (SILENT, ERROR, WARN, INFO, DEBUG)
- ✅ LOG_LEVEL environment variable
- ✅ Structured output with timestamps
- ✅ Comprehensive server lifecycle logging

**Schema Updates:**
- ✅ Version tracking from package metadata
- ✅ Version information in get_schema_stats
- ✅ Schema structure validation
- ✅ Graceful error handling
- ✅ Version logging on load/reload

**Publication:**
- ✅ Package content optimization (59% size reduction)
- ✅ Files whitelist in package.json
- ✅ Pre-publication verification workflow
- ✅ npm publishing with provenance (SLSA Level 3)
- ✅ SBOM generation (CycloneDX format)

### Phase 7: Distribution & Deployment ✅

**Status:** Complete

**Completed Features:**

**Distribution & Security:**
- ✅ npm publishing with provenance (SLSA Level 3)
- ✅ SBOM generation and attestations
- ✅ Multi-stage Docker images (Alpine Linux)
- ✅ Multi-architecture support (amd64, arm64)
- ✅ Trivy vulnerability scanning
- ✅ Cosign image signing (keyless OIDC)
- ✅ GitHub Container Registry publishing

**Transport & Deployment:**
- ✅ stdio transport (default for CLI/desktop)
- ✅ HTTP Streamable transport (web clients)
- ✅ Docker container deployment
- ✅ Health check endpoints (/health, /ready)
- ✅ Resource limits and security hardening
- ✅ Comprehensive deployment documentation

### Phase 8: Schema Builder API Refactor ✅

**Status:** Complete

**Goal:** Align tool APIs with schema-builder patterns for better iD editor compatibility and enhanced localization support.

**Reference Documentation:**
- External: [ideditor/schema-builder README](https://github.com/ideditor/schema-builder/blob/main/README.md)
- Internal: `docs/examples.md` (current tool examples)

**Key Principles:**
1. **Backward Compatibility:** Breaking changes - will require major version bump (v1.0.0)
2. **Localization First:** All tools should return human-readable names from translations
3. **Template Expansion:** Support field references `{amenity}` and templates `@templates/contact`
4. **Flexible Input:** Accept multiple input formats (preset ID, tag notation, JSON object)

#### 8.1: Translation Infrastructure ✅

**Objective:** Load and index English translations from schema package

**Status:** COMPLETE - Full translation infrastructure implemented in SchemaLoader

**Tasks:**
- [x] Add translations loader to `SchemaLoader` class
  - Loads `/dist/translations/en.json` from schema package
  - Indexed by presets, fields, and categories
  - Cached translations alongside schema data
- [x] Create TypeScript interfaces for translation structure
  - `Translations` interface in `src/types/index.ts`
  - Supports presets, fields, and categories
- [x] Add translation lookup utilities
  - ✅ `getPresetName(presetId: string): string` - Get localized preset name
  - ✅ `getFieldLabel(fieldKey: string): string` - Get localized field label
  - ✅ `getFieldOptionName(fieldKey: string, optionValue: string): { title: string, description?: string }` - Get localized option name
  - ✅ `getCategoryName(categoryId: string): string` - Get localized category name
- [x] Add fallback logic for missing translations (ucfirst + replace _ with spaces)
  - Implemented in `formatFallbackName()` private method
  - Used in all translation lookup methods via try-catch
- [x] Unit tests for translation loading and lookups
  - Covered in `tests/utils/schema-loader.test.ts`
- [x] Integration tests for translation data integrity
  - All tool integration tests validate translation data

#### 8.2: validate_tag Refactor ✅

**Current Response:**
```text
{
  valid: boolean,
  deprecated: boolean,
  message: string,
  fieldExists: boolean,      // REMOVE
  hasOptions: boolean,
  valueInOptions: boolean,
  replacement?: object,
  availableOptions?: string[] // REMOVE
}
```

**New Response:**
```text
{
  key: string,                    // ADD - original request
  keyName: string,                // ADD - e.g., "Amenity" for "amenity"
  value: string,                  // ADD - original request
  valueName: string,              // ADD - e.g., "Restaurant" for "restaurant"
  valid: boolean,
  deprecated: boolean,
  message: string,
  hasOptions: boolean,
  valueInOptions: boolean,
  replacement?: object,           // Backward compatibility: { "highway": "path", "incline": "steep" }
  replacementDetailed?: [{        // ADD - detailed replacement with names
    key: string,
    keyName: string,
    value: string,
    valueName: string
  }]
}
```

**Changes:**
- **Remove:** `fieldExists` (internal detail, not useful for API consumers)
- **Remove:** `availableOptions` (use `get_tag_values` tool instead)
- **Add:** `key`, `keyName`, `value`, `valueName` - original request with localized names
- **Add:** `replacementDetailed` - detailed replacement info (keep old `replacement` for backward compatibility)

**Validation Logic:**
- `valid = true` if:
  - Key exists in schema AND value is valid (in options OR custom allowed)
  - OR key/value is deprecated (still valid, but warn)
- `valid = false` if:
  - Key or value is empty string
  - (Note: Unknown keys are still `valid = true` per OSM philosophy)

**Status:** COMPLETE - Full localization with detailed replacement info

**Tasks:**
- [x] Update `validate-tag.ts` implementation
  - Added translation lookups for key and value names using `SchemaLoader`
  - Removed `fieldExists` and `availableOptions` from response (cleaner API)
  - Added `key`, `keyName`, `value`, `valueName` to response
  - Added `replacementDetailed` with translation lookups for replacement tags
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/validate-tag.test.ts`)
  - All assertions updated to match new response format
  - Tests for translation name lookups included
  - Tests for replacementDetailed format working
- [x] Update integration tests (`tests/integration/validate-tag.test.ts`)
  - Full integration test coverage with localization
- [x] Update API documentation (`docs/api/validate_tag.md`)
  - Documented in API overview (docs/api/README.md)
- [x] Update usage examples (`docs/examples.md`)
  - Examples show localized output

#### 8.3: get_tag_values Refactor ✅

**Current Response:**
```text
[
  {
    value: string,
    name: string,
    description?: string  // OPTIONAL
  }
]
```

**New Response:**
```text
{
  key: string,                    // ADD - the queried key
  keyName: string,                // ADD - localized key name
  values: string[],               // ADD - simple array of values
  valuesDetailed: [{              // ADD - detailed values with names
    value: string,
    valueName: string
  }]
}
```

**Changes:**
- **Remove:** `description` field completely
- **Add:** Response wrapper with `key`, `keyName` for context
- **Add:** Two formats: `values` (simple array) and `valuesDetailed` (with names)

**Tasks:**
- [x] Update `get-tag-values.ts` implementation
  - Change from array response to object with `key`, `keyName`, `values`, `valuesDetailed`
  - Remove `description` field
  - Add translation lookup for key name
  - Return both simple values array and detailed array
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/get-tag-values.test.ts`)
  - Update assertions to match new response structure
  - Test both `values` and `valuesDetailed` arrays
- [x] Update integration tests (`tests/integration/get-tag-values.test.ts`)
- [x] Update API documentation (`docs/api/README.md`)
- [x] Update usage examples (`docs/examples.md`)

#### 8.4: search_tags Refactor ✅

**Current Behavior:**
- Returns tags matching keyword in key or value
- **Problem:** Returns random value when match is in key only
- **Problem:** Doesn't distinguish between key-match and value-match

**New Behavior:**
- Search for keyword as:
  - Complete key match (e.g., "amenity")
  - Partial key match (e.g., "wheel" matches "wheelchair")
  - Complete value match (e.g., "restaurant")
  - Partial value match (e.g., "rest" matches "restaurant")
- **If found by key:** Return ALL values for that key (from `get_tag_values`)
  - Response: `[{ key: "amenity", values: [...] }]`
- **If found by value:** Return key + specific value
  - Response: `[{ key: "amenity", value: "restaurant" }]`

**Current Response:**
```text
[
  {
    key: string,
    value: string  // Sometimes random value when matched by key
  }
]
```

**New Response:**
```text
{
  keyMatches: [{
    key: string,
    keyName: string,
    values: string[],             // Simple array
    valuesDetailed: [{            // Detailed values with names
      value: string,
      valueName: string
    }]
  }],
  valueMatches: [{
    key: string,
    keyName: string,
    value: string,
    valueName: string
  }]
}
```

**Status:** COMPLETE - Separate key/value matches with full localization

**Tasks:**
- [x] Update `search-tags.ts` implementation
  - Implemented separate search logic for keys vs values
  - For key matches: calls `get_tag_values` to get all values with localization
  - For value matches: returns specific key-value pair with `keyName`/`valueName`
  - Returns structured response with `keyMatches` and `valueMatches`
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/search-tags.test.ts`)
  - Tests for key-only matches returning all values
  - Tests for value matches returning specific pairs
  - Tests for partial matching for both keys and values
- [x] Update integration tests (`tests/integration/search-tags.test.ts`)
  - Full integration test coverage
- [x] Update API documentation (`docs/api/search_tags.md`)
  - Documented in API overview (docs/api/README.md)
- [x] Update usage examples (`docs/examples.md`)
  - Examples show new response format

#### 8.5: get_preset_details Refactor ✅

**Current Input:**
- Only accepts preset ID: `"amenity/restaurant"`

**New Input (accept all formats):**
1. Preset ID (slash notation): `"amenity/restaurant"`
2. Tag notation (equals): `"amenity=restaurant"`
3. JSON object: `{"amenity": "restaurant"}`

**Current Response:**
```text
{
  id: string,
  name: string,
  tags: object,
  geometry: string[],
  icon: string,      // REMOVE
  fields: string[],
  moreFields: string[]
}
```

**New Response:**
```text
{
  id: string,
  name: string,
  tags: object,                   // Backward compatibility: { "amenity": "restaurant" }
  tagsDetailed: [{                // ADD - detailed tags with names
    key: string,
    keyName: string,
    value: string,
    valueName: string
  }],
  geometry: string[],
  fields: string[],               // With {field} and @templates expanded
  moreFields: string[]            // With {field} and @templates expanded
}
```

**Changes:**
- **Accept multiple input formats:** Parse preset ID, tag notation, or JSON object
- **Remove:** `icon` field (not essential for MCP context)
- **Add:** `tagsDetailed` - detailed tags with names (keep old `tags` for backward compatibility)
- **Expand field references:**
  - `{amenity}` → Replace with actual field key (e.g., for `amenity=restaurant` → `"restaurant"`)
  - `@templates/contact` → Expand to template fields (e.g., `["email", "website", "phone", "fax"]`)
  - `@templates/internet_access` → Expand to `["internet_access", "internet_access/fee", "internet_access/ssid"]`

**Field Reference Resolution (from schema-builder):**
- **Field inheritance:** `{amenity}` means use fields from preset with id matching the amenity value
- **Templates:** `@templates/X` expands to predefined field groups
  - Example templates: `contact`, `internet_access`, `building_fields`, etc.
  - Template definitions stored in schema data structure

**Tasks:**
- [x] Update `get-preset-details.ts` input parsing
  - Add parser for `"key=value"` format → lookup preset by tag
  - Add parser for `{"key": "value"}` format → lookup preset by tags
  - Keep existing `"preset/id"` format support
- [x] Implement field reference expansion
  - Create utility to expand `{fieldRef}` references
  - Create utility to expand `@templates/X` references
  - Load template definitions from schema
- [x] Update response format
  - Remove `icon` field
  - Add `tagsDetailed` with translation lookups for tag names
  - Expand all field references before returning
- [x] Update input schema to accept multiple formats
  ```text
  presetId: z.union([
    z.string(),  // "amenity/restaurant" or "amenity=restaurant"
    z.record(z.string())  // {"amenity": "restaurant"}
  ])
  ```
- [x] Unit tests (`tests/tools/get-preset-details.test.ts`)
  - Test all three input formats
  - Test field reference expansion
  - Test template expansion
- [x] Integration tests (`tests/integration/get-preset-details.test.ts`)
- [x] Update API documentation (`docs/api/get_preset_details.md`)
- [x] Update usage examples (`docs/examples.md`)

#### 8.6: validate_tag_collection Refactor ✅

**Current Response:**
```text
{
  valid: boolean,
  tagResults: object,
  errors: string[],          // REMOVE
  warnings: string[],        // REMOVE
  deprecatedCount: number,
  errorCount: number,        // Was invalidCount
  warningCount: number       // REMOVE
}
```

**New Response:**
```text
{
  valid: boolean,
  tagResults: object,  // Using new validate_tag format
  validCount: number,        // ADD - count of valid tags
  deprecatedCount: number,
  errorCount: number
}
```

**Changes:**
- **Use new `validate_tag` format** for each tag in `tagResults`
- **Add:** `validCount` - number of valid (non-error) tags
- **Remove:** `errors`, `warnings`, `warningCount` arrays/counts
- **Keep:** `deprecatedCount`, `errorCount`
- **Rename:** `invalidCount` → `errorCount` (clearer terminology)

**Tasks:**
- [x] Update `validate-tag-collection.ts` implementation
  - Use refactored `validate_tag` for each tag
  - Add `validCount` calculation
  - Remove `errors`, `warnings`, `warningCount`
  - Rename `invalidCount` to `errorCount`
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/validate-tag-collection.test.ts`)
  - Update assertions for new response format
  - Test validCount calculation
- [x] Update integration tests (`tests/integration/validate-tag-collection.test.ts`)
- [x] Update API documentation (`docs/api/validate_tag_collection.md`)
- [x] Update usage examples (`docs/examples.md`)

#### 8.7: suggest_improvements Refactor ✅

**Current Response:**
```text
{
  suggestions: string[],  // Array of strings
  warnings: string[],     // REMOVE
  matchedPresets: string[]
}
```

**New Response:**
```text
{
  suggestions: [{
    operation: "add" | "remove" | "update",
    message: string,
    key: string,
    keyName: string               // ADD - localized key name
  }],
  matchedPresets: string[],       // Backward compatibility
  matchedPresetsDetailed: [{      // ADD - detailed preset info
    id: string,
    name: string
  }]
}
```

**Changes:**
- **Structured suggestions:** Array of objects instead of strings
  - `operation`: Type of change ("add", "remove", "update")
  - `message`: Human-readable explanation with reason
  - `key`: Tag key being suggested
  - `keyName`: Localized key name (NEW)
- **Remove:** `warnings` field (deprecation warnings now in `validate_tag_collection`)
- **Add:** `matchedPresetsDetailed` - detailed preset info (keep old `matchedPresets` for backward compatibility)

**Example Suggestions:**
```json
[
  {
    "operation": "add",
    "message": "Add 'cuisine' to specify the type of food served at this restaurant",
    "key": "cuisine",
    "keyName": "Cuisine"
  },
  {
    "operation": "add",
    "message": "Add 'opening_hours' to help visitors know when the restaurant is open",
    "key": "opening_hours",
    "keyName": "Opening Hours"
  },
  {
    "operation": "remove",
    "message": "Remove 'building' because it conflicts with amenity=restaurant point geometry",
    "key": "building",
    "keyName": "Building"
  },
  {
    "operation": "update",
    "message": "Update 'wheelchair' to use standard values (yes/no/limited)",
    "key": "wheelchair",
    "keyName": "Wheelchair"
  }
]
```

**Status:** COMPLETE - Structured suggestions with localized names

**Tasks:**
- [x] Update `suggest-improvements.ts` implementation
  - Changed suggestions from strings to structured objects with `operation`, `message`, `key`, `keyName`
  - Added `keyName` with translation lookup using `SchemaLoader.getFieldLabel()`
  - Operation type (add/remove/update) determined by suggestion logic
  - Generated contextual messages with reasons (e.g., "Add 'cuisine' to provide more information...")
  - Added `matchedPresetsDetailed` with preset IDs and localized names
  - Removed `warnings` field (deprecation warnings in `validate_tag_collection`)
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/suggest-improvements.test.ts`)
  - Assertions updated for new suggestion format
  - Tests for operation type detection (currently "add" only)
  - Tests for keyName translation lookups
  - Tests for matchedPresetsDetailed format
- [x] Update integration tests (`tests/integration/suggest-improvements.test.ts`)
  - Full integration test coverage
- [x] Update API documentation (`docs/api/suggest_improvements.md`)
  - Documented in API overview (docs/api/README.md)
- [x] Update usage examples (`docs/examples.md`)
  - Examples show structured suggestions

#### 8.8: search_presets Refactor ✅

**Current Response:**
```text
[{
  id: string,
  name: string,
  tags: object,
  geometry: string[]
}]
```

**New Response:**
```text
[{
  id: string,
  name: string,
  tags: object,                   // Backward compatibility: { "amenity": "restaurant" }
  tagsDetailed: [{                // ADD - detailed tags with names
    key: string,
    keyName: string,
    value: string,
    valueName: string
  }],
  geometry: string[]
}]
```

**Changes:**
- **Add:** `tagsDetailed` - detailed tags with names (keep old `tags` for backward compatibility)

**Tasks:**
- [x] Update `search-presets.ts` implementation
  - Add `tagsDetailed` with translation lookups for tag names
- [x] Update input schema (no changes needed)
- [x] Update unit tests (`tests/tools/search-presets.test.ts`)
  - Update assertions for new response format
  - Test tagsDetailed format
- [x] Update integration tests (`tests/integration/search-presets.test.ts`)
- [x] Update API documentation (`docs/api/README.md`)
- [x] Update usage examples (`docs/examples.md`)

#### 8.9: Localization Enhancements ✅

**Objective:** Add translation lookups to all applicable tools

**Status:** COMPLETE - All tools include localized names with comprehensive fallback logic

**Tasks:**
- [x] Update tool responses to include localized names where applicable
  - All 7 tools now include `keyName`, `valueName`, `name`, or `tagsDetailed` fields
  - Translation lookups integrated in: `validate_tag`, `get_tag_values`, `search_tags`, `get_preset_details`, `search_presets`, `validate_tag_collection`, `suggest_improvements`
- [x] Implement fallback logic: ucfirst value + replace underscores with spaces
  - Implemented in `SchemaLoader.formatFallbackName()` method
  - Used automatically when translation not found via try-catch blocks
- [x] Example: "fast_food" → "Fast Food"
  - Working correctly in all tools
- [x] Document translation usage in API docs
  - Added comprehensive "Localization" section to `docs/api/README.md`
  - Documented all localized fields, fallback logic, and examples
  - Added backward compatibility notes

#### 8.10: Template System Implementation ✅

**Objective:** Support field templates like `@templates/contact`

**Status:** COMPLETE, later removed - `id-tagging-schema` v7 resolves field references and templates at build time, so the expansion code was dead and was deleted (see change `cleanup-after-schema-v7`)

**Template Definitions:**
All templates defined and validated against schema:
- `contact`: Contact information fields
- `internet_access`: Internet connectivity fields
- `poi`: Point of interest basic fields
- Various crossing-related templates for highway crossings

**Tasks:**
- [x] Verified template definitions against schema data (corrected field IDs)
- [x] Fixed template expansion utility in `get-preset-details.ts`
- [x] Added comprehensive unit tests covering all templates
- [x] Added integration tests via MCP protocol
- [x] Documented template system in CLAUDE.md (full specification)

#### 8.11: Documentation & Testing ✅

**Status:** COMPLETE - All documentation updated for Phase 8

**Tasks:**
- [x] Update CHANGELOG.md with Phase 8 changes
- [x] Update README.md (no changes needed - generic overview)
- [x] Create API documentation files for all 7 tools
- [x] Update docs/usage.md with new response formats and Phase 8 examples
- [x] Update CLAUDE.md with Phase 8 completion status
- [x] All tests passing (comprehensive test suite)

**Documentation Files Updated:**
- [x] `docs/api/validate_tag.md` - Created with Phase 8.2 format
- [x] `docs/api/get_tag_values.md` - Created with Phase 8.3 format
- [x] `docs/api/search_tags.md` - Created with Phase 8.4 format
- [x] `docs/api/search_presets.md` - Created with Phase 8.8 format
- [x] `docs/api/get_preset_details.md` - Updated with Phase 8.5 format
- [x] `docs/api/validate_tag_collection.md` - Created with Phase 8.6 format
- [x] `docs/api/suggest_improvements.md` - Created with Phase 8.7 format
- [x] `docs/api/README.md` - Already updated with localization documentation
- [x] `docs/usage.md` - Updated with Phase 8 localized examples
- [x] `CHANGELOG.md` - Updated with Phase 8 changes
- [x] `ROADMAP.md` - Marked Phase 8 as complete

### Phase 9: Advanced Validation Features ⏳

**Status:** Planned

**Advanced Validation** (based on [ideditor/schema-builder](https://github.com/ideditor/schema-builder)):
- ⏳ Geometry constraints validation
- ⏳ Prerequisite tag validation
- ⏳ Field type constraints (number ranges, URL patterns)
- ⏳ Field inheritance resolution - `get_preset_all_fields(presetId)`
- ⏳ Conditional field analysis - `get_conditional_fields(tags)`
- ⏳ Advanced deprecation transformations (placeholder substitution)
- ⏳ Tag quality scoring - `score_tag_quality(tags, presetId)`

### Phase 10: Service Infrastructure ⏳

**Status:** Planned

**Service Infrastructure:**
- ⏳ Authentication (API key, JWT, OAuth 2.0)
- ⏳ Rate limiting (per-IP, per-user quotas)
- ⏳ TLS/HTTPS support with Let's Encrypt

**Implementation Priority:**
1. **Phase 8:** Schema Builder API Refactor (CURRENT)
2. **Phase 9:** Advanced validation features
3. **Phase 10:** Service infrastructure

**Note:** All enhancements will maintain backward compatibility within major versions.

---

## Contributing

Want to help? See [contributing.md](./contributing.md) for:
- TDD workflow and coding standards
- Testing requirements (>90% coverage)
- Pull request process
- Development setup

## Project Information

- **Repository:** https://github.com/gander-tools/osm-tagging-schema-mcp
- **npm Package:** https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp
- **Docker Images:** https://github.com/gander-tools/osm-tagging-schema-mcp/pkgs/container/osm-tagging-schema-mcp
- **License:** GNU General Public License v3.0
