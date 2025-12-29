import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { prompts } from "../../src/prompts/index.js";
import { setupClientServer, type TestServer, teardownClientServer } from "./helpers.js";

/**
 * Integration tests for MCP prompts
 *
 * Requirements:
 * - Server should advertise prompts capability
 * - Server should list all registered prompts
 * - Server should return prompt details correctly
 * - Server should execute prompts and return messages
 */

describe("Prompts Integration", () => {
	let client: Client;
	let server: TestServer;

	beforeEach(async () => {
		({ client, server } = await setupClientServer());
	});

	afterEach(async () => {
		await teardownClientServer(client, server);
	});

	describe("Prompts Capability", () => {
		it("should advertise prompts capability in server info", async () => {
			// Server info should include prompts capability
			const serverCapabilities = (client as { _serverCapabilities?: { prompts?: unknown } })
				._serverCapabilities;

			assert.ok(
				serverCapabilities?.prompts !== undefined,
				"Server should advertise prompts capability",
			);
		});
	});

	describe("List Prompts", () => {
		it("should list all registered prompts", async () => {
			const result = await client.listPrompts();

			assert.ok(result.prompts, "Should return prompts list");
			assert.equal(
				result.prompts.length,
				prompts.length,
				`Should have ${prompts.length} prompts registered`,
			);

			// Verify all expected prompts are present
			const expectedNames = [
				"validate-osm-feature",
				"find-preset",
				"learn-tag",
				"improve-tags",
				"explore-category",
			];

			for (const name of expectedNames) {
				const found = result.prompts.find((p) => p.name === name);
				assert.ok(found, `Prompt '${name}' should be in the list`);
			}
		});

		it("each listed prompt should have description", async () => {
			const result = await client.listPrompts();

			for (const prompt of result.prompts) {
				assert.ok(prompt.description, `Prompt '${prompt.name}' should have a description`);

				assert.ok(
					prompt.description.length >= 50,
					`Prompt '${prompt.name}' description should be meaningful`,
				);
			}
		});
	});

	describe("Get Prompt", () => {
		it("should return prompt messages for validate-osm-feature", async () => {
			const result = await client.getPrompt({
				name: "validate-osm-feature",
				arguments: {
					featureType: "restaurant",
					tags: "amenity=restaurant\nname=Test Cafe",
				},
			});

			assert.ok(result.messages, "Should return messages");
			assert.ok(result.messages.length > 0, "Should have at least one message");

			const message = result.messages[0];
			assert.equal(message.role, "user", "Message should have user role");
			assert.ok(message.content.type === "text", "Message content should be text type");
		});

		it("should return prompt messages for find-preset", async () => {
			const result = await client.getPrompt({
				name: "find-preset",
				arguments: {
					featureDescription: "coffee shop",
				},
			});

			assert.ok(result.messages, "Should return messages");
			assert.ok(result.messages.length > 0, "Should have at least one message");
		});

		it("should return prompt messages for learn-tag", async () => {
			const result = await client.getPrompt({
				name: "learn-tag",
				arguments: {
					tagKey: "amenity",
				},
			});

			assert.ok(result.messages, "Should return messages");

			const text = (result.messages[0].content as { text: string }).text.toLowerCase();
			assert.ok(text.includes("amenity"), "Message should include the tag key");
		});

		it("should return prompt messages for improve-tags", async () => {
			const result = await client.getPrompt({
				name: "improve-tags",
				arguments: {
					currentTags: "amenity=restaurant",
				},
			});

			assert.ok(result.messages, "Should return messages");
		});

		it("should return prompt messages for explore-category", async () => {
			const result = await client.getPrompt({
				name: "explore-category",
				arguments: {
					category: "amenity",
				},
			});

			assert.ok(result.messages, "Should return messages");

			const text = (result.messages[0].content as { text: string }).text.toLowerCase();
			assert.ok(text.includes("amenity"), "Message should include the category");
		});
	});

	describe("Prompt Message Content", () => {
		it("prompts should mention specific tool names in workflow", async () => {
			const result = await client.getPrompt({
				name: "validate-osm-feature",
				arguments: {
					featureType: "restaurant",
					tags: "amenity=restaurant",
				},
			});

			const text = (result.messages[0].content as { text: string }).text;

			// Should mention actual tool names
			assert.ok(
				text.includes("validate_tag_collection") || text.includes("validate"),
				"Should mention validation tool",
			);

			assert.ok(
				text.includes("suggest_improvements") || text.includes("suggest"),
				"Should mention suggestions tool",
			);
		});
	});
});
