import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareTags } from "../../src/tools/compare-tags.js";

describe("compareTags", () => {
	describe("Basic Functionality", () => {
		it("should detect added tags", async () => {
			const oldTags = {
				amenity: "cafe",
			};
			const newTags = {
				amenity: "cafe",
				name: "New Cafe",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.added, 1);
			assert.strictEqual(result.statistics.total, 1);

			const addedChange = result.changes.find((c) => c.type === "added");
			assert.ok(addedChange);
			assert.strictEqual(addedChange.key, "name");
			assert.strictEqual(addedChange.newValue, "New Cafe");
			assert.strictEqual(addedChange.oldValue, undefined);
		});

		it("should detect removed tags", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Old Cafe",
			};
			const newTags = {
				amenity: "cafe",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.removed, 1);
			assert.strictEqual(result.statistics.total, 1);

			const removedChange = result.changes.find((c) => c.type === "removed");
			assert.ok(removedChange);
			assert.strictEqual(removedChange.key, "name");
			assert.strictEqual(removedChange.oldValue, "Old Cafe");
			assert.strictEqual(removedChange.newValue, undefined);
		});

		it("should detect modified tags", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Old Cafe",
			};
			const newTags = {
				amenity: "restaurant",
				name: "Old Cafe",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.modified, 1);
			assert.strictEqual(result.statistics.total, 1);

			const modifiedChange = result.changes.find((c) => c.type === "modified");
			assert.ok(modifiedChange);
			assert.strictEqual(modifiedChange.key, "amenity");
			assert.strictEqual(modifiedChange.oldValue, "cafe");
			assert.strictEqual(modifiedChange.newValue, "restaurant");
		});

		it("should handle unchanged tags (not shown by default)", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Same Cafe",
			};
			const newTags = {
				amenity: "cafe",
				name: "Same Cafe",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.unchanged, 2);
			assert.strictEqual(result.statistics.total, 0);
			assert.strictEqual(result.changes.length, 0); // Unchanged not shown by default
		});

		it("should show unchanged tags when requested", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Same Cafe",
			};
			const newTags = {
				amenity: "cafe",
				name: "Same Cafe",
			};

			const result = await compareTags(oldTags, newTags, { showUnchanged: true });

			assert.ok(result);
			assert.strictEqual(result.statistics.unchanged, 2);
			assert.strictEqual(result.changes.length, 2);

			const unchangedChanges = result.changes.filter((c) => c.type === "unchanged");
			assert.strictEqual(unchangedChanges.length, 2);
		});
	});

	describe("Complex Scenarios", () => {
		it("should handle multiple change types", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Old Cafe",
				cuisine: "coffee",
			};
			const newTags = {
				amenity: "restaurant",
				name: "Old Cafe",
				opening_hours: "Mo-Su 10:00-22:00",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.added, 1); // opening_hours
			assert.strictEqual(result.statistics.removed, 1); // cuisine
			assert.strictEqual(result.statistics.modified, 1); // amenity
			assert.strictEqual(result.statistics.unchanged, 1); // name
			assert.strictEqual(result.statistics.total, 3);
		});

		it("should handle completely different tag sets", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Old Place",
			};
			const newTags = {
				leisure: "park",
				park: "city_park",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.added, 2);
			assert.strictEqual(result.statistics.removed, 2);
			assert.strictEqual(result.statistics.modified, 0);
			assert.strictEqual(result.statistics.total, 4);
		});

		it("should handle empty old tags", async () => {
			const oldTags = {};
			const newTags = {
				amenity: "cafe",
				name: "New Cafe",
			};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.added, 2);
			assert.strictEqual(result.statistics.total, 2);
		});

		it("should handle empty new tags", async () => {
			const oldTags = {
				amenity: "cafe",
				name: "Old Cafe",
			};
			const newTags = {};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.removed, 2);
			assert.strictEqual(result.statistics.total, 2);
		});

		it("should handle both empty", async () => {
			const oldTags = {};
			const newTags = {};

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.total, 0);
			assert.strictEqual(result.changes.length, 0);
		});
	});

	describe("Result Structure", () => {
		it("should return correct result structure", async () => {
			const oldTags = { amenity: "cafe" };
			const newTags = { amenity: "restaurant" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.ok("changes" in result);
			assert.ok("statistics" in result);
			assert.ok(Array.isArray(result.changes));
			assert.strictEqual(typeof result.statistics, "object");
		});

		it("should have correct statistics structure", async () => {
			const oldTags = { amenity: "cafe" };
			const newTags = { amenity: "restaurant" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result.statistics);
			assert.ok("total" in result.statistics);
			assert.ok("added" in result.statistics);
			assert.ok("removed" in result.statistics);
			assert.ok("modified" in result.statistics);
			assert.ok("unchanged" in result.statistics);
		});

		it("should sort changes by key alphabetically", async () => {
			const oldTags = { zebra: "1", apple: "2", middle: "3" };
			const newTags = { zebra: "changed", apple: "changed", middle: "changed" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.changes[0].key, "apple");
			assert.strictEqual(result.changes[1].key, "middle");
			assert.strictEqual(result.changes[2].key, "zebra");
		});
	});

	describe("Diff Output Formats", () => {
		it("should not include diff by default", async () => {
			const oldTags = { amenity: "cafe" };
			const newTags = { amenity: "restaurant" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.diff, undefined);
		});

		it("should generate unified diff format", async () => {
			const oldTags = { amenity: "cafe", name: "Old Cafe" };
			const newTags = { amenity: "restaurant", cuisine: "italian" };

			const result = await compareTags(oldTags, newTags, { diffFormat: "unified" });

			assert.ok(result);
			assert.ok(result.diff);
			assert.ok(result.diff.includes("📝 Tag Changes (Unified Diff)"));
			assert.ok(result.diff.includes("- amenity=cafe"));
			assert.ok(result.diff.includes("+ amenity=restaurant"));
			assert.ok(result.diff.includes("+ cuisine=italian"));
			assert.ok(result.diff.includes("- name=Old Cafe"));
		});

		it("should generate split diff format", async () => {
			const oldTags = { amenity: "cafe" };
			const newTags = { amenity: "restaurant" };

			const result = await compareTags(oldTags, newTags, { diffFormat: "split" });

			assert.ok(result);
			assert.ok(result.diff);
			assert.ok(result.diff.includes("📝 Tag Changes (Split View)"));
			assert.ok(result.diff.includes("OLD"));
			assert.ok(result.diff.includes("NEW"));
			assert.ok(result.diff.includes("amenity=cafe"));
			assert.ok(result.diff.includes("amenity=restaurant"));
		});

		it("should generate summary diff format", async () => {
			const oldTags = { amenity: "cafe", name: "Old" };
			const newTags = { amenity: "restaurant", cuisine: "italian" };

			const result = await compareTags(oldTags, newTags, { diffFormat: "summary" });

			assert.ok(result);
			assert.ok(result.diff);
			assert.ok(result.diff.includes("📊 Change Summary"));
			assert.ok(result.diff.includes("Total changes:"));
			assert.ok(result.diff.includes("Added:"));
			assert.ok(result.diff.includes("Removed:"));
			assert.ok(result.diff.includes("Modified:"));
		});

		it("should show unchanged tags in unified diff when requested", async () => {
			const oldTags = { amenity: "cafe", name: "Same" };
			const newTags = { amenity: "restaurant", name: "Same" };

			const result = await compareTags(oldTags, newTags, {
				diffFormat: "unified",
				showUnchanged: true,
			});

			assert.ok(result);
			assert.ok(result.diff);
			assert.ok(result.diff.includes("  name=Same"));
		});
	});

	describe("Edge Cases", () => {
		it("should handle special characters in values", async () => {
			const oldTags = { "name:en": "Café & Bär" };
			const newTags = { "name:en": "Restaurant & Bar" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.modified, 1);
		});

		it("should handle tags with colons in keys", async () => {
			const oldTags = { "addr:street": "Main Street" };
			const newTags = { "addr:street": "Main Avenue" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.modified, 1);
			assert.strictEqual(result.changes[0].key, "addr:street");
		});

		it("should handle numeric-looking values as strings", async () => {
			const oldTags = { capacity: "50" };
			const newTags = { capacity: "100" };

			const result = await compareTags(oldTags, newTags);

			assert.ok(result);
			assert.strictEqual(result.statistics.modified, 1);
			assert.strictEqual(result.changes[0].oldValue, "50");
			assert.strictEqual(result.changes[0].newValue, "100");
		});
	});
});
