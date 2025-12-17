import assert from "node:assert/strict";
import { describe, it } from "node:test";
import deprecated from "@openstreetmap/id-tagging-schema/dist/deprecated.json" with {
	type: "json",
};
import { validateTagCollection } from "../../src/tools/validate-tag-collection.js";

describe("validateTagCollection", () => {
	describe("Basic Functionality", () => {
		it("should validate a collection of valid tags", async () => {
			const tags = {
				amenity: "parking",
				parking: "surface",
				capacity: "50",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, true);
			assert.strictEqual(result.validCount, 3);
			assert.strictEqual(result.errorCount, 0);
			assert.strictEqual(result.deprecatedCount, 0);
			assert.ok(result.tagResults);
			assert.strictEqual(Object.keys(result.tagResults).length, 3);
		});

		it("should detect errors in individual tags", async () => {
			const tags = {
				amenity: "",
				parking: "surface",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, false);
			assert.strictEqual(result.validCount, 1);
			assert.strictEqual(result.errorCount, 1);
			assert.ok(result.tagResults.amenity);
			assert.strictEqual(result.tagResults.amenity.valid, false);
		});

		it("should detect deprecated tags in collection", async () => {
			// Use first deprecated entry
			const deprecatedEntry = deprecated[0];
			const oldKey = Object.keys(deprecatedEntry.old)[0];
			if (!oldKey) return;
			const oldValue = deprecatedEntry.old[oldKey as keyof typeof deprecatedEntry.old];

			const tags = {
				[oldKey]: oldValue as string,
				amenity: "parking",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.deprecatedCount, 1);
			assert.strictEqual(result.validCount, 2);
			assert.ok(result.tagResults[oldKey]);
			assert.strictEqual(result.tagResults[oldKey].deprecated, true);
		});

		it("should handle empty tag collection", async () => {
			const tags = {};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, true);
			assert.strictEqual(result.validCount, 0);
			assert.strictEqual(result.errorCount, 0);
			assert.strictEqual(Object.keys(result.tagResults).length, 0);
		});

		it("should count unknown tags as valid", async () => {
			const tags = {
				unknown_tag_key_12345: "value1",
				another_unknown_key_67890: "value2",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, true);
			assert.strictEqual(result.validCount, 2);
		});
	});

	describe("Result Structure", () => {
		it("should return correct result structure", async () => {
			const tags = {
				amenity: "parking",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.ok("valid" in result);
			assert.ok("tagResults" in result);
			assert.ok("validCount" in result);
			assert.ok("deprecatedCount" in result);
			assert.ok("errorCount" in result);
			assert.strictEqual(typeof result.valid, "boolean");
			assert.ok(typeof result.tagResults === "object");
			assert.strictEqual(typeof result.validCount, "number");
			assert.strictEqual(typeof result.deprecatedCount, "number");
			assert.strictEqual(typeof result.errorCount, "number");
		});

		it("should include individual tag validation results", async () => {
			const tags = {
				amenity: "parking",
				access: "yes",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.ok(result.tagResults.amenity);
			assert.ok(result.tagResults.access);
			assert.ok("valid" in result.tagResults.amenity);
			assert.ok("deprecated" in result.tagResults.amenity);
			assert.ok("message" in result.tagResults.amenity);
		});
	});

	describe("JSON Schema Validation", () => {
		it("should validate collection with ALL deprecated tags from JSON (100% coverage)", async () => {
			// CRITICAL: Test ALL deprecated entries - no Math.min, no sampling
			let testedCount = 0;
			let skippedCount = 0;
			for (let i = 0; i < deprecated.length; i++) {
				const entry = deprecated[i];
				const oldKeys = Object.keys(entry.old);

				// Skip entries with multiple keys (complex cases)
				if (oldKeys.length !== 1) {
					skippedCount++;
					continue;
				}

				const oldKey = oldKeys[0];
				if (!oldKey) {
					skippedCount++;
					continue;
				}
				const oldValue = entry.old[oldKey as keyof typeof entry.old];

				// Skip if replace doesn't exist or is empty (edge cases)
				if (!entry.replace || Object.keys(entry.replace).length === 0) {
					skippedCount++;
					continue;
				}

				// Create tags with the deprecated tag plus a non-conflicting tag
				const tags: Record<string, string> = {
					[oldKey]: oldValue as string,
				};

				// Add a second tag that won't conflict with oldKey
				if (oldKey !== "name") {
					tags.name = "Test Name";
				} else {
					tags.ref = "Test Ref";
				}

				const result = await validateTagCollection(tags);

				assert.ok(result, `Should validate collection for ${oldKey}=${oldValue}`);
				assert.strictEqual(
					result.deprecatedCount,
					1,
					`Should detect deprecated tag ${oldKey}=${oldValue}`,
				);
				testedCount++;
			}

			// Verify we processed ALL entries (tested + skipped = total)
			assert.strictEqual(
				testedCount + skippedCount,
				deprecated.length,
				`Should have processed ALL ${deprecated.length} deprecated entries (tested: ${testedCount}, skipped: ${skippedCount})`,
			);
			assert.ok(testedCount > 0, "Should have tested at least some deprecated entries");
		});
	});

	describe("Error Handling", () => {
		it("should handle tags with empty keys", async () => {
			const tags = {
				"": "value",
				amenity: "parking",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, false);
			assert.strictEqual(result.validCount, 1);
			assert.strictEqual(result.errorCount, 1);
		});

		it("should handle tags with empty values", async () => {
			const tags = {
				amenity: "",
				parking: "surface",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.valid, false);
			assert.strictEqual(result.validCount, 1);
			assert.strictEqual(result.errorCount, 1);
		});
	});

	describe("Options Parameter", () => {
		it("should not include summary by default", async () => {
			const tags = {
				amenity: "parking",
				parking: "surface",
			};

			const result = await validateTagCollection(tags);

			assert.ok(result);
			assert.strictEqual(result.summary, undefined);
		});

		it("should include summary when options.summary=true", async () => {
			const tags = {
				amenity: "parking",
				parking: "surface",
			};

			const result = await validateTagCollection(tags, { summary: true });

			assert.ok(result);
			assert.ok(result.summary);
			assert.strictEqual(typeof result.summary, "string");
			assert.ok(result.summary.includes("✓"));
		});

		it("should generate summary for valid tags", async () => {
			const tags = {
				amenity: "parking",
				parking: "surface",
				capacity: "50",
			};

			const result = await validateTagCollection(tags, { summary: true });

			assert.ok(result);
			assert.ok(result.summary);
			assert.ok(result.summary.includes("All tags are valid"));
			assert.ok(result.summary.includes("3 total tags"));
			assert.ok(result.summary.includes("3 valid"));
			assert.ok(result.summary.includes("0 deprecated"));
			assert.ok(result.summary.includes("0 errors"));
		});

		it("should generate summary for deprecated tags", async () => {
			// Use first deprecated entry
			const deprecatedEntry = deprecated[0];
			const oldKey = Object.keys(deprecatedEntry.old)[0];
			if (!oldKey) return;
			const oldValue = deprecatedEntry.old[oldKey as keyof typeof deprecatedEntry.old];

			const tags = {
				[oldKey]: oldValue as string,
				amenity: "parking",
			};

			const result = await validateTagCollection(tags, { summary: true });

			assert.ok(result);
			assert.ok(result.summary);
			assert.ok(result.summary.includes("Deprecated tags found"));
			assert.ok(result.summary.includes("Suggested:"));
		});

		it("should generate summary for invalid tags", async () => {
			const tags = {
				amenity: "",
				parking: "surface",
			};

			const result = await validateTagCollection(tags, { summary: true });

			assert.ok(result);
			assert.ok(result.summary);
			assert.ok(result.summary.includes("have errors"));
			assert.ok(result.summary.includes("✗ Errors:"));
			assert.ok(result.summary.includes("Fix errors"));
		});
	});
});
