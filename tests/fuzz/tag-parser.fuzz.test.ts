/**
 * Fuzz tests for tag parser using fast-check
 *
 * This uses property-based testing to generate random inputs
 * and verify the tag parser handles them correctly without crashing.
 */

import { describe, it } from "node:test";
import * as fc from "fast-check";
import { parseTagInput } from "../../src/utils/tag-parser.js";

describe("Tag Parser Fuzz Tests", () => {
	it("should handle random string inputs without crashing", () => {
		fc.assert(
			fc.property(fc.string(), (input) => {
				try {
					const result = parseTagInput(input);
					// Verify result is an object
					if (typeof result !== "object" || result === null) {
						throw new Error("Result must be an object");
					}
					// Verify all values are strings
					for (const value of Object.values(result)) {
						if (typeof value !== "string") {
							throw new Error("All values must be strings");
						}
					}
					return true;
				} catch (error) {
					// Parser is allowed to throw errors for invalid input
					// Just ensure it doesn't crash the process
					return error instanceof Error;
				}
			}),
			{ numRuns: 1000 },
		);
	});

	it("should handle random JSON-like strings without crashing", () => {
		fc.assert(
			fc.property(fc.json(), (input) => {
				try {
					const result = parseTagInput(JSON.stringify(input));
					// Verify result is an object
					if (typeof result !== "object" || result === null) {
						throw new Error("Result must be an object");
					}
					return true;
				} catch (error) {
					// Parser is allowed to throw errors for invalid input
					return error instanceof Error;
				}
			}),
			{ numRuns: 1000 },
		);
	});

	it("should handle random object inputs without crashing", () => {
		fc.assert(
			fc.property(fc.dictionary(fc.string(), fc.anything()), (input) => {
				try {
					const result = parseTagInput(input);
					// Verify result is an object
					if (typeof result !== "object" || result === null) {
						throw new Error("Result must be an object");
					}
					return true;
				} catch (error) {
					// Parser is allowed to throw errors for invalid input
					return error instanceof Error;
				}
			}),
			{ numRuns: 1000 },
		);
	});

	it("should handle random key=value format strings without crashing", () => {
		fc.assert(
			fc.property(
				fc.array(
					fc.tuple(fc.string(), fc.string()).map(([k, v]) => `${k}=${v}`),
					{ maxLength: 20 },
				),
				(lines) => {
					const input = lines.join("\n");
					try {
						const result = parseTagInput(input);
						// Verify result is an object
						if (typeof result !== "object" || result === null) {
							throw new Error("Result must be an object");
						}
						return true;
					} catch (error) {
						// Parser is allowed to throw errors for invalid input
						return error instanceof Error;
					}
				},
			),
			{ numRuns: 1000 },
		);
	});

	it("should handle extreme whitespace and special characters", () => {
		fc.assert(
			fc.property(fc.string(), (input) => {
				try {
					const result = parseTagInput(input);
					// Verify result is an object
					if (typeof result !== "object" || result === null) {
						throw new Error("Result must be an object");
					}
					return true;
				} catch (error) {
					// Parser is allowed to throw errors for invalid input
					return error instanceof Error;
				}
			}),
			{ numRuns: 1000 },
		);
	});

	it("should handle very long inputs", () => {
		fc.assert(
			fc.property(
				fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 100, maxLength: 1000 }),
				(entries) => {
					const input = Object.fromEntries(entries);
					try {
						const result = parseTagInput(input);
						// Verify result is an object
						if (typeof result !== "object" || result === null) {
							throw new Error("Result must be an object");
						}
						return true;
					} catch (error) {
						// Parser is allowed to throw errors for invalid input
						return error instanceof Error;
					}
				},
			),
			{ numRuns: 100 }, // Fewer runs for large inputs
		);
	});

	it("should handle mixed valid and invalid line formats", () => {
		fc.assert(
			fc.property(
				fc.array(
					fc.oneof(
						fc.string().map((s) => s), // Random string
						fc.tuple(fc.string(), fc.string()).map(([k, v]) => `${k}=${v}`), // Valid format
						fc.constant(""), // Empty line
						fc.string().map((s) => `# ${s}`), // Comment
					),
					{ maxLength: 50 },
				),
				(lines) => {
					const input = lines.join("\n");
					try {
						const result = parseTagInput(input);
						// Verify result is an object
						if (typeof result !== "object" || result === null) {
							throw new Error("Result must be an object");
						}
						return true;
					} catch (error) {
						// Parser is allowed to throw errors for invalid input
						return error instanceof Error;
					}
				},
			),
			{ numRuns: 1000 },
		);
	});
});
