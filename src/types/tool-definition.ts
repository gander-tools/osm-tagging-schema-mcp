/**
 * Tool definition types for MCP SDK McpServer API
 *
 * This module defines the interface structure for MCP tools following
 * the new registerTool() pattern with McpServer.
 */

import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape } from "zod";

// Re-export types from MCP SDK for convenience
export type { ToolAnnotations, ToolCallback };

/**
 * Tool configuration returned by config() function
 *
 * Defines tool metadata, input/output schemas, and annotations.
 * Input schema uses MCP-specific format: object with Zod validators.
 */
export interface ToolConfig<
	TInputSchema extends ZodRawShape = ZodRawShape,
	TOutputSchema extends ZodRawShape = ZodRawShape,
> {
	/** Tool display title (optional) */
	title?: string;

	/** Human-readable tool description */
	description?: string;

	/**
	 * Input validation schema using Zod v3
	 *
	 * MCP-specific format: object with Zod field validators
	 * Example:
	 * ```typescript
	 * inputSchema: {
	 *   tagKey: z.string().describe('OSM tag key to query'),
	 *   limit: z.number().int().positive().optional().describe('Maximum results')
	 * }
	 * ```
	 */
	inputSchema?: TInputSchema;

	/**
	 * Output validation schema using Zod v3 (optional)
	 *
	 * Same format as inputSchema
	 */
	outputSchema?: TOutputSchema;

	/** Tool annotations for metadata and hints */
	annotations?: ToolAnnotations;

	/** Additional metadata (extensible) */
	_meta?: Record<string, unknown>;
}

/**
 * OSM Tool Definition - unified interface for all tools in this project
 *
 * Each MCP tool must conform to this structure:
 * - name: Unique tool identifier
 * - config(): Function returning tool configuration
 * - handler: Async callback implementing tool logic (from MCP SDK)
 *
 * Example:
 * ```typescript
 * const GetTagInfo: OsmToolDefinition = {
 *   name: 'get_tag_info',
 *   config: () => ({
 *     description: 'Get comprehensive information about an OSM tag',
 *     inputSchema: {
 *       tagKey: z.string().describe('Tag key to query')
 *     }
 *   }),
 *   handler: async (args, extra) => {
 *     const { tagKey } = args;
 *     return {
 *       content: [{ type: 'text', text: JSON.stringify(result) }]
 *     };
 *   }
 * };
 * ```
 */
export interface OsmToolDefinition<TInputSchema extends ZodRawShape = ZodRawShape> {
	/**
	 * Tool identifier (e.g., "get_tag_info")
	 *
	 * Must be unique across all tools in the server.
	 */
	readonly name: string;

	/**
	 * Configuration function returning tool metadata and schemas
	 *
	 * Must be a function (not static object) to allow dynamic generation.
	 * Returns tool description, input/output schemas, and annotations.
	 */
	config: () => ToolConfig<TInputSchema>;

	/**
	 * Tool implementation handler
	 *
	 * Handler from MCP SDK that receives pre-validated arguments from Zod.
	 * Always receives two parameters: (args, extra)
	 * - args: Validated input arguments based on inputSchema
	 * - extra: RequestHandlerExtra with signal, requestId, etc.
	 */
	handler: ToolCallback<TInputSchema>;
}
