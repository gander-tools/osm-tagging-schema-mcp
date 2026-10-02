# OSM Tagging Schema MCP - Tool Examples

This document provides comprehensive examples for all tools in the OSM Tagging Schema MCP server. Each example shows real requests and responses, covering both valid and invalid inputs.

## Table of Contents

1. [validate_tag](#1-validate_tag)
2. [get_tag_values](#2-get_tag_values)
3. [search_tags](#3-search_tags)
4. [get_preset_details](#4-get_preset_details)
5. [search_presets](#5-search_presets)
6. [validate_tag_collection](#6-validate_tag_collection)
7. [suggest_improvements](#7-suggest_improvements)

---

## 1. validate_tag

**Purpose**: Validate a single tag key-value pair. Checks if the key exists in the schema, if the value is valid for that key, and if the tag is deprecated.

**Input**: `key` (string), `value` (string) - both required

### Example 1.1: Valid Key + Valid Value (Standard Option)

**Request**:
```json
{
  "key": "access",
  "value": "yes"
}
```

**Response**:
```json
{
  "valid": true,
  "deprecated": false,
  "message": "Tag 'access=yes' is valid. Value is one of the standard options for this key.",
  "fieldExists": true,
  "hasOptions": true,
  "valueInOptions": true
}
```

### Example 1.2: Valid Key + Valid Value (Custom Value Allowed)

**Request**:
```json
{
  "key": "building",
  "value": "custom_warehouse"
}
```

**Response**:
```json
{
  "valid": true,
  "deprecated": false,
  "message": "Tag 'building=custom_warehouse' is valid. Custom values are allowed for this key.",
  "fieldExists": true,
  "hasOptions": true,
  "valueInOptions": false
}
```

### Example 1.3: Valid Key + Valid Value (Deprecated Tag)

**Request**:
```json
{
  "key": "highway",
  "value": "incline_steep"
}
```

**Response**:
```json
{
  "valid": true,
  "deprecated": true,
  "message": "Tag 'highway=incline_steep' is valid but deprecated. Consider using the replacement.",
  "replacement": {
    "highway": "path",
    "incline": "steep"
  },
  "fieldExists": true
}
```

### Example 1.4: Valid Key + Invalid Value (Field with Strict Options)

**Request**:
```json
{
  "key": "parking",
  "value": "invalid_type"
}
```

**Response**:
```json
{
  "valid": true,
  "deprecated": false,
  "message": "Tag 'parking=invalid_type' is valid. Custom values are allowed, but 'invalid_type' is not in the standard options.",
  "fieldExists": true,
  "hasOptions": true,
  "valueInOptions": false,
  "availableOptions": ["surface", "underground", "multi-storey", "street_side", "lane", "carports", "sheds", "garage_boxes", "rooftop"]
}
```

### Example 1.5: Invalid Key (Unknown Key)

**Request**:
```json
{
  "key": "nonexistent_key_12345",
  "value": "some_value"
}
```

**Response**:
```json
{
  "valid": true,
  "deprecated": false,
  "message": "Tag 'nonexistent_key_12345=some_value' is valid. Key not found in schema, but OSM allows custom tags.",
  "fieldExists": false
}
```

**Note**: According to OSM philosophy, unknown keys are allowed (valid=true) but the response indicates the key is not in the schema.

### Example 1.6: Empty Key (Error)

**Request**:
```json
{
  "key": "",
  "value": "some_value"
}
```

**Response**:
```json
{
  "valid": false,
  "deprecated": false,
  "message": "Tag key cannot be empty"
}
```

### Example 1.7: Empty Value (Error)

**Request**:
```json
{
  "key": "amenity",
  "value": ""
}
```

**Response**:
```json
{
  "valid": false,
  "deprecated": false,
  "message": "Tag value cannot be empty"
}
```

---

## 2. get_tag_values

**Purpose**: Retrieve all possible values for a tag key from the schema with localized names (fields and presets).

**Input**: `tagKey` (string) - required

### Example 2.1: Valid Key with Multiple Values

**Request**:
```json
{
  "tagKey": "amenity"
}
```

**Response**:
```json
{
  "key": "amenity",
  "keyName": "Amenity",
  "values": [
    "animal_boarding",
    "animal_breeding",
    "animal_shelter",
    "arts_centre",
    "atm",
    "bank",
    "bar",
    "bicycle_parking",
    "cafe",
    "car_wash",
    "charging_station",
    "cinema",
    "clinic",
    "college",
    "community_centre",
    "courthouse",
    "dentist",
    "doctors",
    "fast_food",
    "fire_station",
    "fuel",
    "hospital",
    "kindergarten",
    "library",
    "marketplace",
    "parking",
    "pharmacy",
    "place_of_worship",
    "police",
    "post_office",
    "pub",
    "restaurant",
    "school",
    "toilets",
    "townhall",
    "university"
  ],
  "valuesDetailed": [
    {
      "value": "animal_boarding",
      "valueName": "Animal Boarding"
    },
    {
      "value": "animal_breeding",
      "valueName": "Animal Breeding"
    },
    {
      "value": "animal_shelter",
      "valueName": "Animal Shelter"
    },
    {
      "value": "arts_centre",
      "valueName": "Arts Centre"
    },
    {
      "value": "atm",
      "valueName": "ATM"
    },
    {
      "value": "bank",
      "valueName": "Bank"
    },
    {
      "value": "bar",
      "valueName": "Bar"
    },
    {
      "value": "bicycle_parking",
      "valueName": "Bicycle Parking"
    },
    {
      "value": "cafe",
      "valueName": "Cafe"
    },
    {
      "value": "car_wash",
      "valueName": "Car Wash"
    }
  ]
}
```

**Note**:
- The response includes both `values` (simple string array) and `valuesDetailed` (with localized names).
- Results are sorted alphabetically by value.
- The `valuesDetailed` array is abbreviated for brevity; the actual response contains 100+ amenity values.
- Use `values` for simple lookups, `valuesDetailed` when you need localized names.

### Example 2.2: Valid Key with Localized Names

**Request**:
```json
{
  "tagKey": "parking"
}
```

**Response**:
```json
{
  "key": "parking",
  "keyName": "Type",
  "values": [
    "carports",
    "garage_boxes",
    "lane",
    "multi-storey",
    "rooftop",
    "sheds",
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
      "value": "lane",
      "valueName": "Lane"
    },
    {
      "value": "multi-storey",
      "valueName": "Multi-Storey"
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
      "value": "street_side",
      "valueName": "Street Side"
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

**Note**: Descriptions are no longer included in the response (removed in Phase 8.3 refactor). Use `valuesDetailed` for localized value names.

### Example 2.3: Invalid Key (Non-Existent)

**Request**:
```json
{
  "tagKey": "nonexistent_tag_key_12345"
}
```

**Response**:
```json
{
  "key": "nonexistent_tag_key_12345",
  "keyName": "Nonexistent tag key 12345",
  "values": [],
  "valuesDetailed": []
}
```

**Note**: Returns empty `values` and `valuesDetailed` arrays when the key is not found in the schema. The `keyName` is a fallback formatted name.

### Example 2.4: Valid Key with Colon Separator

**Request**:
```json
{
  "tagKey": "toilets:wheelchair"
}
```

**Response**:
```json
{
  "key": "toilets:wheelchair",
  "keyName": "Toilets Wheelchair",
  "values": [
    "no",
    "yes"
  ],
  "valuesDetailed": [
    {
      "value": "no",
      "valueName": "No"
    },
    {
      "value": "yes",
      "valueName": "Yes"
    }
  ]
}
```

**Note**: The tool accepts both colon (`:`) and slash (`/`) separators for nested keys.

---

## 3. search_tags

**Purpose**: Search for tags by keyword in keys, values, and preset names.

**Input**: `query` (string) - required

### Example 3.1: Query with Results (Multiple Matches)

**Request**:
```json
{
  "query": "wheelchair"
}
```

**Response**:
```json
[
  {
    "key": "toilets:wheelchair",
    "value": "no"
  },
  {
    "key": "toilets:wheelchair",
    "value": "yes"
  },
  {
    "key": "wheelchair",
    "value": "designated"
  },
  {
    "key": "wheelchair",
    "value": "limited"
  },
  {
    "key": "wheelchair",
    "value": "no"
  },
  {
    "key": "wheelchair",
    "value": "yes"
  }
]
```

**Note**: Search is case-insensitive and finds tags from both fields.json and presets.json. Results are limited to 100 entries.

### Example 3.2: Query with Results (Single Tag)

**Request**:
```json
{
  "query": "restaurant"
}
```

**Response**:
```json
[
  {
    "key": "amenity",
    "value": "restaurant"
  },
  {
    "key": "cuisine",
    "value": "african"
  },
  {
    "key": "cuisine",
    "value": "american"
  },
  {
    "key": "cuisine",
    "value": "asian"
  },
  {
    "key": "cuisine",
    "value": "chinese"
  },
  {
    "key": "cuisine",
    "value": "french"
  },
  {
    "key": "cuisine",
    "value": "indian"
  },
  {
    "key": "cuisine",
    "value": "italian"
  },
  {
    "key": "cuisine",
    "value": "japanese"
  },
  {
    "key": "cuisine",
    "value": "mexican"
  },
  {
    "key": "cuisine",
    "value": "pizza"
  },
  {
    "key": "cuisine",
    "value": "regional"
  },
  {
    "key": "cuisine",
    "value": "seafood"
  },
  {
    "key": "cuisine",
    "value": "thai"
  },
  {
    "key": "diet:vegan",
    "value": "no"
  },
  {
    "key": "diet:vegan",
    "value": "only"
  },
  {
    "key": "diet:vegan",
    "value": "yes"
  },
  {
    "key": "diet:vegetarian",
    "value": "no"
  },
  {
    "key": "diet:vegetarian",
    "value": "only"
  },
  {
    "key": "diet:vegetarian",
    "value": "yes"
  }
]
```

**Note**: Results are limited to 100 entries. The list above is abbreviated for brevity.

### Example 3.3: Query without Results (No Matches)

**Request**:
```json
{
  "query": "nonexistentkeywordinosm12345xyz"
}
```

**Response**:
```json
[]
```

**Note**: Returns an empty array when no tags match the query.

### Example 3.4: Case-Insensitive Search

**Request (lowercase)**:
```json
{
  "query": "park"
}
```

**Request (uppercase)**:
```json
{
  "query": "PARK"
}
```

**Response**: Both requests return identical results:
```json
[
  {
    "key": "amenity",
    "value": "bicycle_parking"
  },
  {
    "key": "amenity",
    "value": "parking"
  },
  {
    "key": "leisure",
    "value": "park"
  },
  {
    "key": "tourism",
    "value": "theme_park"
  }
]
```

---

## 4. get_preset_details

**Purpose**: Get complete details for a specific preset including tags, geometry, fields, and metadata. Accepts multiple input formats (preset ID, tag notation, or tags object) and returns the preset's field lists.

**Input**: `presetId` (string | object) - required

**Phase 8.5 Updates**:
- Accepts three input formats (preset ID, tag notation, tags object)
- Returns `tagsDetailed` with localized key/value names
- Icon field removed (not essential for MCP context)
- Name field now required (always includes localized preset name)

### Example 4.1: Preset ID Format

**Request**:
```json
{
  "presetId": "amenity/restaurant"
}
```

**Response**:
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

### Example 4.2: Tag Notation Format (Phase 8.5)

**Request**:
```json
{
  "presetId": "amenity=parking"
}
```

**Response**:
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

### Example 4.3: Tags Object Format (Phase 8.5)

**Request**:
```json
{
  "presetId": {
    "highway": "residential"
  }
}
```

**Response**:
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

### Example 4.4: Invalid Preset ID (Non-Existent)

**Request**:
```json
{
  "presetId": "nonexistent/preset"
}
```

**Response**: Error thrown:
```json
{
  "error": "Preset 'nonexistent/preset' not found"
}
```

**Note**: The tool throws an error (not just returns empty result) when a preset ID is not found.

---

## 5. search_presets

**Purpose**: Search for presets by keyword, tag filter, or geometry type.

**Input**: `keyword` (string, required), `geometry` (string, optional), `limit` (number, optional)

**Output** (Phase 8.8 format): Each preset includes:
- `id`: Preset identifier (e.g., "amenity/restaurant")
- `name`: Localized preset name (e.g., "Restaurant")
- `tags`: Tag key-value pairs (e.g., `{"amenity": "restaurant"}`)
- `tagsDetailed`: Array of tag details with localized names for keys and values
- `geometry`: Supported geometry types (e.g., `["point", "area"]`)

### Example 5.1: Query with Results (Keyword Search)

**Request**:
```json
{
  "keyword": "restaurant"
}
```

**Response**:
```json
[
  {
    "id": "amenity/fast_food",
    "name": "Fast Food Restaurant",
    "tags": {
      "amenity": "fast_food"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant",
    "name": "Restaurant",
    "tags": {
      "amenity": "restaurant"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/american",
    "name": "American Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "american"
    },
    "tagsDetailed": [
      {
        "key": "amenity",
        "keyName": "Amenity",
        "value": "restaurant",
        "valueName": "Restaurant"
      },
      {
        "key": "cuisine",
        "keyName": "Cuisine",
        "value": "american",
        "valueName": "American"
      }
    ],
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/asian",
    "name": "Asian Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "asian"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/chinese",
    "name": "Chinese Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "chinese"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/french",
    "name": "French Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "french"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/italian",
    "name": "Italian Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "italian"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/japanese",
    "name": "Japanese Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "japanese"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/mexican",
    "name": "Mexican Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "mexican"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/pizza",
    "name": "Pizza Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "pizza"
    },
    "geometry": ["point", "area"]
  }
]
```

**Note**: Results include all presets matching "restaurant" in ID or name. The list above is abbreviated for brevity.

### Example 5.2: Query without Results

**Request**:
```json
{
  "keyword": "nonexistentpresetxyz12345"
}
```

**Response**:
```json
[]
```

### Example 5.3: Tag Filter (Exact Match)

**Request**:
```json
{
  "keyword": "amenity=cafe"
}
```

**Response**:
```json
[
  {
    "id": "amenity/cafe",
    "name": "Cafe",
    "tags": {
      "amenity": "cafe"
    },
    "tagsDetailed": [
      {
        "key": "amenity",
        "keyName": "Amenity",
        "value": "cafe",
        "valueName": "Cafe"
      }
    ],
    "geometry": ["point", "area"]
  }
]
```

**Note**: Tag filters use `key=value` format. Only presets with an exact tag match are returned. The `tagsDetailed` array provides localized names for both keys and values (Phase 8.8).

### Example 5.4: Geometry Filter

**Request**:
```json
{
  "keyword": "restaurant",
  "geometry": "area"
}
```

**Response**:
```json
[
  {
    "id": "amenity/restaurant",
    "name": "Restaurant",
    "tags": {
      "amenity": "restaurant"
    },
    "geometry": ["point", "area"]
  },
  {
    "id": "amenity/restaurant/american",
    "name": "American Restaurant",
    "tags": {
      "amenity": "restaurant",
      "cuisine": "american"
    },
    "geometry": ["point", "area"]
  }
]
```

**Note**: Only presets supporting "area" geometry are returned. Valid geometry values: `point`, `line`, `area`, `relation`.

### Example 5.5: Limit Parameter

**Request**:
```json
{
  "keyword": "building",
  "limit": 5
}
```

**Response**:
```json
[
  {
    "id": "building",
    "name": "Building",
    "tags": {
      "building": "yes"
    },
    "geometry": ["area"]
  },
  {
    "id": "building/apartments",
    "name": "Apartment Building",
    "tags": {
      "building": "apartments"
    },
    "geometry": ["area"]
  },
  {
    "id": "building/barn",
    "name": "Barn",
    "tags": {
      "building": "barn"
    },
    "geometry": ["area"]
  },
  {
    "id": "building/bunker",
    "name": "Bunker",
    "tags": {
      "building": "bunker"
    },
    "geometry": ["area"]
  },
  {
    "id": "building/cabin",
    "name": "Cabin",
    "tags": {
      "building": "cabin"
    },
    "geometry": ["area"]
  }
]
```

**Note**: The `limit` parameter restricts the number of results returned.

---

## 6. validate_tag_collection

**Purpose**: Validate a collection of tags and provide aggregated statistics about valid tags, errors, and deprecated tags.

**Input**: `tags` (object) - required (key-value pairs)

### Example 6.1: Valid Tag Collection

**Request**:
```json
{
  "tags": {
    "amenity": "parking",
    "parking": "surface",
    "capacity": "50",
    "fee": "no"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "tagResults": {
    "amenity": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'amenity=parking' is valid. Value is one of the standard options for this key.",
      "fieldExists": true,
      "hasOptions": true,
      "valueInOptions": true
    },
    "parking": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'parking=surface' is valid. Value is one of the standard options for this key.",
      "fieldExists": true,
      "hasOptions": true,
      "valueInOptions": true
    },
    "capacity": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'capacity=50' is valid.",
      "fieldExists": true,
      "hasOptions": false
    },
    "fee": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'fee=no' is valid. Value is one of the standard options for this key.",
      "fieldExists": true,
      "hasOptions": true,
      "valueInOptions": true
    }
  },
  "validCount": 4,
  "deprecatedCount": 0,
  "errorCount": 0
}
```

### Example 6.2: Collection with Invalid Values (Errors)

**Request**:
```json
{
  "tags": {
    "amenity": "",
    "parking": "surface"
  }
}
```

**Response**:
```json
{
  "valid": false,
  "tagResults": {
    "amenity": {
      "valid": false,
      "deprecated": false,
      "message": "Tag value cannot be empty"
    },
    "parking": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'parking=surface' is valid. Value is one of the standard options for this key.",
      "fieldExists": true,
      "hasOptions": true,
      "valueInOptions": true
    }
  },
  "validCount": 1,
  "deprecatedCount": 0,
  "errorCount": 1
}
```

### Example 6.3: Collection with Deprecated Tags

**Request**:
```json
{
  "tags": {
    "highway": "incline_steep",
    "amenity": "parking"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "tagResults": {
    "highway": {
      "valid": true,
      "deprecated": true,
      "message": "Tag 'highway=incline_steep' is valid but deprecated. Consider using the replacement.",
      "replacement": {
        "highway": "path",
        "incline": "steep"
      },
      "fieldExists": true
    },
    "amenity": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'amenity=parking' is valid. Value is one of the standard options for this key.",
      "fieldExists": true,
      "hasOptions": true,
      "valueInOptions": true
    }
  },
  "validCount": 2,
  "deprecatedCount": 1,
  "errorCount": 0
}
```

### Example 6.4: Collection with Unknown Keys

**Request**:
```json
{
  "tags": {
    "unknown_key_12345": "value1",
    "another_unknown_key": "value2"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "tagResults": {
    "unknown_key_12345": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'unknown_key_12345=value1' is valid. Key not found in schema, but OSM allows custom tags.",
      "fieldExists": false
    },
    "another_unknown_key": {
      "valid": true,
      "deprecated": false,
      "message": "Tag 'another_unknown_key=value2' is valid. Key not found in schema, but OSM allows custom tags.",
      "fieldExists": false
    }
  },
  "validCount": 2,
  "deprecatedCount": 0,
  "errorCount": 0
}
```

### Example 6.5: Empty Collection

**Request**:
```json
{
  "tags": {}
}
```

**Response**:
```json
{
  "valid": true,
  "tagResults": {},
  "validCount": 0,
  "deprecatedCount": 0,
  "errorCount": 0
}
```

---

## 7. suggest_improvements

**Purpose**: Analyze a tag collection and suggest missing fields or improvements based on matched presets.

**Input**: `tags` (object) - required (key-value pairs)

### Example 7.1: Collection with Suggestions (Incomplete Tags)

**Request**:
```json
{
  "tags": {
    "amenity": "restaurant"
  }
}
```

**Response**:
```json
{
  "suggestions": [
    "Consider adding 'name' - commonly used for restaurants",
    "Consider adding 'cuisine' - specifies the type of food served",
    "Consider adding 'opening_hours' - helps visitors know when the restaurant is open",
    "Consider adding 'phone' - contact information for customers",
    "Consider adding 'website' - provides more information about the restaurant",
    "Consider adding 'wheelchair' - accessibility information"
  ],
  "warnings": [],
  "matchedPresets": [
    "amenity/restaurant"
  ]
}
```

### Example 7.2: Collection with Deprecated Tags (Warnings)

**Request**:
```json
{
  "tags": {
    "highway": "incline_steep"
  }
}
```

**Response**:
```json
{
  "suggestions": [],
  "warnings": [
    "Tag 'highway=incline_steep' is deprecated. Consider replacing with: highway=path, incline=steep"
  ],
  "matchedPresets": []
}
```

### Example 7.3: Complete Tag Collection (Fewer Suggestions)

**Request**:
```json
{
  "tags": {
    "amenity": "restaurant",
    "name": "Pizza Place",
    "cuisine": "pizza",
    "opening_hours": "Mo-Su 11:00-22:00",
    "phone": "+1-555-1234",
    "website": "https://example.com",
    "wheelchair": "yes"
  }
}
```

**Response**:
```json
{
  "suggestions": [
    "Consider adding 'address' - helps visitors find the location"
  ],
  "warnings": [],
  "matchedPresets": [
    "amenity/restaurant",
    "amenity/restaurant/pizza"
  ]
}
```

**Note**: Fewer suggestions because most common fields are already present.

### Example 7.4: Empty Collection (No Suggestions)

**Request**:
```json
{
  "tags": {}
}
```

**Response**:
```json
{
  "suggestions": [],
  "warnings": [],
  "matchedPresets": []
}
```

### Example 7.5: Collection with Unknown Tags (No Matching Presets)

**Request**:
```json
{
  "tags": {
    "unknown_key_xyz": "unknown_value_123"
  }
}
```

**Response**:
```json
{
  "suggestions": [],
  "warnings": [],
  "matchedPresets": []
}
```

**Note**: No suggestions because the tags don't match any known presets.

---

## Summary of Test Coverage

Each tool has comprehensive test coverage for all valid/invalid input combinations:

| Tool | Valid Cases | Invalid Cases | Edge Cases | Total |
|------|-------------|---------------|------------|-------|
| **validate_tag** | key✓ value✓ (standard, custom, deprecated) | key✗, value="" | key="" | 7 |
| **get_tag_values** | key✓ | key✗ | key with colon | 3 |
| **search_tags** | query→results | query→no results | case-insensitive | 3 |
| **get_preset_details** | presetId✓ | presetId✗ (error) | - | 2 |
| **search_presets** | query, tag filter, geometry filter | query→no results | limit parameter | 5 |
| **validate_tag_collection** | valid collection | invalid values, deprecated, unknown keys | empty collection | 5 |
| **suggest_improvements** | incomplete→suggestions, complete→fewer | deprecated→warnings | empty, unknown | 5 |

**Total Examples**: 30 comprehensive examples covering all tools and scenarios.

---

## Testing

All examples in this document are verified by the comprehensive test suite:

- **Unit tests**: `tests/tools/*.test.ts` - Test tool logic with JSON schema validation
- **Integration tests**: `tests/integration/*.test.ts` - Test MCP protocol communication

Run tests with:
```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm test                 # All tests
```

---

## Additional Resources

- [API Documentation](../api/README.md) - Detailed API reference
- [Usage Guide](./usage.md) - Common workflows and best practices
- [OSM Wiki](https://wiki.openstreetmap.org/wiki/Tags) - Official OSM tagging documentation
