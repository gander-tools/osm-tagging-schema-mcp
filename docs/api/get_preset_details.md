# get_preset_details

Get complete details for a specific OSM preset including tags, geometry, fields, and metadata.

## Description

Returns comprehensive information about an OSM preset, including its identifying tags, supported geometry types, field lists, and localized names. Field lists are returned fully resolved: since `@openstreetmap/id-tagging-schema` v7 the schema resolves field references and templates at build time, so the tool returns `fields` and `moreFields` exactly as stored in the schema.

**Phase 8.5 Updates:**
- Accepts multiple input formats (preset ID, tag notation, JSON object)
- Returns `tagsDetailed` with localized key/value names
- Icon field removed (not essential for MCP context)
- Name field now required (always includes localized preset name)

## Category

Preset Discovery Tools

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `presetId` | string \| object | Yes | Preset identifier in one of three formats |

### Input Formats

The `presetId` parameter accepts three different formats:

**Format 1: Preset ID (slash notation)**
```json
"amenity/restaurant"
```

**Format 2: Tag Notation (equals sign)**
```json
"amenity=restaurant"
```

**Format 3: Tags Object (JSON)**
```json
{
  "amenity": "restaurant"
}
```

For multi-tag objects, the tool finds the most specific matching preset:
```json
{
  "amenity": "restaurant",
  "cuisine": "vietnamese"
}
```

## Output

Returns a JSON object with the following structure (Phase 8.5 format):

```typescript
{
  id: string;                 // Preset ID (e.g., "amenity/restaurant")
  name: string;               // Localized preset name (e.g., "Restaurant")
  tags: object;               // Tags object (backward compatibility)
  tagsDetailed: Array<{       // Tags with localized names (Phase 8.5)
    key: string;              // Tag key (e.g., "amenity")
    keyName: string;          // Localized key name (e.g., "Amenity")
    value: string;            // Tag value (e.g., "restaurant")
    valueName: string;        // Localized value name (e.g., "Restaurant")
  }>;
  geometry: string[];         // Supported geometry types
  fields?: string[];          // Field list (optional)
  moreFields?: string[];      // Additional fields (optional)
}
```

### Output Fields

- **id**: Unique preset identifier in slash notation
- **name**: Human-readable preset name (localized)
- **tags**: Simple key-value object for backward compatibility
- **tagsDetailed**: Array of tags with localized names (new in Phase 8.5)
- **geometry**: Array of supported geometry types (`point`, `line`, `area`, `relation`)
- **fields**: Primary field list (optional)
- **moreFields**: Additional field list (optional)

## Examples

### Example 1: Basic Preset Query (Preset ID Format)

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": "amenity/restaurant"
  }
}
```

**Response:**
```json
{
  "id": "amenity/restaurant",
  "name": "Restaurant",
  "tags": {
    "amenity": "restaurant"
  },
  "tagsDetailed": [
    {
      "key": "amenity",
      "keyName": "Amenity",
      "value": "restaurant",
      "valueName": "Restaurant"
    }
  ],
  "geometry": ["point", "area"],
  "fields": [
    "name",
    "cuisine",
    "diet_multi",
    "address",
    "building_area_yes",
    "opening_hours",
    "capacity",
    "takeaway"
  ],
  "moreFields": [
    "contact:email",
    "contact:phone",
    "contact:website",
    "contact:fax",
    "internet_access",
    "internet_access/fee",
    "internet_access/ssid",
    "outdoor_seating",
    "delivery",
    "smoking",
    "wheelchair"
  ]
}
```

### Example 2: Tag Notation Format

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": "amenity=parking"
  }
}
```

**Response:**
```json
{
  "id": "amenity/parking",
  "name": "Parking Lot",
  "tags": {
    "amenity": "parking"
  },
  "tagsDetailed": [
    {
      "key": "amenity",
      "keyName": "Amenity",
      "value": "parking",
      "valueName": "Parking"
    }
  ],
  "geometry": ["point", "area"],
  "fields": ["name", "parking", "operator", "address", "capacity"]
}
```

### Example 3: JSON Object Format

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": {
      "highway": "residential"
    }
  }
}
```

**Response:**
```json
{
  "id": "highway/residential",
  "name": "Residential Road",
  "tags": {
    "highway": "residential"
  },
  "tagsDetailed": [
    {
      "key": "highway",
      "keyName": "Highway",
      "value": "residential",
      "valueName": "Residential"
    }
  ],
  "geometry": ["line", "area"],
  "fields": ["name", "ref", "surface", "maxspeed", "lanes", "oneway"]
}
```

## Error Scenarios

### Preset Not Found

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": "nonexistent/preset"
  }
}
```

**Error:**
```
Error: Preset "nonexistent/preset" not found
```

### Invalid Tag Notation

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": "invalid_format"
  }
}
```

**Error:**
```
Error: Preset "invalid_format" not found
```

### Non-existent Tag Combination

**Request:**
```json
{
  "name": "get_preset_details",
  "arguments": {
    "presetId": {
      "nonexistent": "value"
    }
  }
}
```

**Error:**
```
Error: Preset not found for input: {"nonexistent":"value"}
```

## Use Cases

### 1. Feature Form Building
Build dynamic forms for OSM feature editing with complete field lists:
```javascript
const details = await get_preset_details("amenity/restaurant");
console.log("Required fields:", details.fields);
console.log("Optional fields:", details.moreFields);
```

### 2. Tag Validation
Verify if a tag combination matches a known preset:
```javascript
const tags = { amenity: "restaurant", cuisine: "italian" };
const details = await get_preset_details(tags);
console.log("Matched preset:", details.id);
```

### 3. Preset Discovery
Find preset details using flexible input formats:
```javascript
// Same result from three formats:
const details1 = await get_preset_details("amenity/cafe");
const details2 = await get_preset_details("amenity=cafe");
const details3 = await get_preset_details({ amenity: "cafe" });
```

### 4. Field Inheritance Analysis
Understand field inheritance relationships:
```javascript
const details = await get_preset_details("building_point");
console.log("Inherited fields from building preset:", details.fields);
```

### 5. Localization
Get localized names for UI display:
```javascript
const details = await get_preset_details("amenity/restaurant");
console.log("Display name:", details.name);  // "Restaurant"
details.tagsDetailed.forEach(tag => {
  console.log(`${tag.keyName}: ${tag.valueName}`);  // "Amenity: Restaurant"
});
```

## Related Tools

- `search_presets` - Search for presets by keyword or tag filters
- `get_tag_values` - Get all possible values for a tag key
- `validate_tag_collection` - Validate a collection of tags

## Notes

- Wildcard tag values (`*`) are excluded from `tagsDetailed` array
- The tool prefers exact tag matches when multiple presets match the input
- Icon field removed in Phase 8.5 (not essential for MCP server context)

## Data Source

- Preset data: `@openstreetmap/id-tagging-schema/dist/presets.json`
- Field data: `@openstreetmap/id-tagging-schema/dist/fields.json`
- Translations: `@openstreetmap/id-tagging-schema/dist/translations/en.json`

## Version History

- **Phase 8.5** (Current): Multiple input formats, field expansion, tagsDetailed, icon removed
- **v0.1.0**: Initial implementation with preset ID format only
