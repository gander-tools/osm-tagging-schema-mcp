# get_tag_values

Get all possible values for an OSM tag key with localized names.

## Description

Retrieves all valid values for a given OSM tag key from the schema. Returns both a simple array of values and a detailed array with localized names for each value.

**Phase 8.3 Updates:**
- Returns structured response with `key`, `keyName`, `values`, and `valuesDetailed`
- Each value includes localized `valueName`
- No description field (not included in current implementation)

## Category

Tag Query Tools

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tagKey` | string | Yes | The OSM tag key to query (e.g., "highway", "amenity") |

## Output

Returns a JSON object with the following structure (Phase 8.3 format):

```typescript
{
  key: string;                    // Tag key (e.g., "highway")
  keyName: string;                // Localized key name (e.g., "Highway")
  values: string[];               // Array of all valid values (sorted alphabetically)
  valuesDetailed: Array<{         // Detailed value information
    value: string;                // Value identifier (e.g., "motorway")
    valueName: string;            // Localized value name (e.g., "Motorway")
  }>;
}
```

### Output Fields

- **key**: The queried tag key (same as input parameter)
- **keyName**: Human-readable, localized key name (e.g., "Highway" for "highway")
- **values**: Simple array of value identifiers, sorted alphabetically (e.g., ["motorway", "primary", "residential"])
- **valuesDetailed**: Detailed array with localized names for each value
  - **value**: The value identifier (machine-readable)
  - **valueName**: Human-readable, localized value name

## Examples

### Example 1: Highway Values

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {
    "tagKey": "highway"
  }
}
```

**Response:**
```json
{
  "key": "highway",
  "keyName": "Highway",
  "values": [
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "residential",
    "service",
    "..."
  ],
  "valuesDetailed": [
    {
      "value": "motorway",
      "valueName": "Motorway"
    },
    {
      "value": "trunk",
      "valueName": "Trunk"
    },
    {
      "value": "primary",
      "valueName": "Primary"
    },
    {
      "value": "residential",
      "valueName": "Residential"
    }
  ]
}
```

### Example 2: Parking Values

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {
    "tagKey": "parking"
  }
}
```

**Response:**
```json
{
  "key": "parking",
  "keyName": "Parking",
  "values": [
    "carports",
    "garage_boxes",
    "half_on_kerb",
    "lane",
    "layby",
    "multi-storey",
    "on_kerb",
    "rooftop",
    "sheds",
    "shoulder",
    "street_side",
    "surface",
    "underground"
  ],
  "valuesDetailed": [
    {
      "value": "carports",
      "valueName": "Carports"
    },
    {
      "value": "garage_boxes",
      "valueName": "Garage Boxes"
    },
    {
      "value": "half_on_kerb",
      "valueName": "Half On Kerb"
    },
    {
      "value": "lane",
      "valueName": "Roadside Lane"
    },
    {
      "value": "layby",
      "valueName": "Turnout / Lay-By"
    },
    {
      "value": "multi-storey",
      "valueName": "Multilevel"
    },
    {
      "value": "on_kerb",
      "valueName": "On Kerb"
    },
    {
      "value": "rooftop",
      "valueName": "Rooftop"
    },
    {
      "value": "sheds",
      "valueName": "Sheds"
    },
    {
      "value": "shoulder",
      "valueName": "Shoulder"
    },
    {
      "value": "street_side",
      "valueName": "Street-Side"
    },
    {
      "value": "surface",
      "valueName": "Surface"
    },
    {
      "value": "underground",
      "valueName": "Underground"
    }
  ]
}
```

### Example 3: Amenity Values (Large List)

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {
    "tagKey": "amenity"
  }
}
```

**Response (truncated):**
```json
{
  "key": "amenity",
  "keyName": "Amenity",
  "values": [
    "bar",
    "cafe",
    "fast_food",
    "restaurant",
    "hospital",
    "pharmacy",
    "bank",
    "atm",
    "parking",
    "..."
  ],
  "valuesDetailed": [
    {
      "value": "bar",
      "valueName": "Bar"
    },
    {
      "value": "cafe",
      "valueName": "Cafe"
    },
    {
      "value": "fast_food",
      "valueName": "Fast Food"
    },
    {
      "value": "restaurant",
      "valueName": "Restaurant"
    }
  ]
}
```

### Example 4: Custom Field (Not in Schema)

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {
    "tagKey": "custom_field"
  }
}
```

**Response:**
```json
{
  "key": "custom_field",
  "keyName": "Custom Field",
  "values": [],
  "valuesDetailed": []
}
```

## Error Scenarios

### Missing Required Parameter

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {}
}
```

**Error:**
```
Error: Missing required parameter: tagKey
```

### Empty Tag Key

**Request:**
```json
{
  "name": "get_tag_values",
  "arguments": {
    "tagKey": ""
  }
}
```

**Response:**
```json
{
  "key": "",
  "keyName": "",
  "values": [],
  "valuesDetailed": []
}
```

## Use Cases

### 1. Building Tag Editor Dropdowns
Populate dropdown menus with available tag values:
```javascript
const result = await get_tag_values("highway");
const dropdown = result.valuesDetailed.map(v => ({
  value: v.value,
  label: v.valueName
}));
```

### 2. Tag Autocomplete
Provide autocomplete suggestions for tag values:
```javascript
const result = await get_tag_values("amenity");
const suggestions = result.values.filter(v => v.startsWith(userInput));
```

### 3. Validation Rules
Check if a value is valid for a given key:
```javascript
const result = await get_tag_values("parking");
const isValid = result.values.includes(userValue);
```

### 4. Localized Display
Show human-readable tag information to users:
```javascript
const result = await get_tag_values("highway");
console.log(`${result.keyName} options:`);
result.valuesDetailed.forEach(v => {
  console.log(`  - ${v.valueName}`);
});
```

### 5. Documentation Generation
Generate documentation for OSM tag keys:
```javascript
const result = await get_tag_values("building");
generateDocs({
  key: result.keyName,
  values: result.valuesDetailed
});
```

## Related Tools

- `search_tags` - Search for tags by keyword
- `validate_tag` - Validate a specific tag key-value pair
- `get_preset_details` - Get full preset details including fields

## Notes

- Returns empty arrays for tag keys not in the schema (custom tags)
- Values are sourced from both field definitions and presets in the schema
- Values are sorted alphabetically for consistent ordering
- Localized names use English translations with intelligent fallback formatting
- Field options are extracted from `field.options` array and preset tags
- Wildcard values (*) and complex patterns (|) are excluded from results

## Data Source

- Field data: `@openstreetmap/id-tagging-schema/dist/fields.json`
- Translations: `@openstreetmap/id-tagging-schema/dist/translations/en.json`

## Version History

- **Phase 8.3** (Current): Structured response with localization (key, keyName, values, valuesDetailed)
- **v0.1.0**: Initial implementation with simple value array
