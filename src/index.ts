#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import http from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { prompts } from "./prompts/index.js";
import { tools } from "./tools/index.js";
import { logger } from "./utils/logger.js";
import { schemaLoader } from "./utils/schema-loader.js";
import {
	captureStartupEvent,
	captureToolError,
	captureToolUsage,
	closeSentry,
	initSentry,
} from "./utils/sentry.js";
import { formatVersionInfo, getVersionInfo } from "./version.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
	const mcpServer = new McpServer(
		{
			name: "osm-tagging-schema",
			version: pkg.version,
			websiteUrl: "https://github.com/gander-tools/osm-tagging-schema-mcp",
			title: "OpenStreetMap Tagging Schema",
		},
		{
			capabilities: {
				tools: {},
				prompts: {},
			},
		},
	);

	// Register all tools using McpServer.registerTool() in a loop.
	// Each handler is wrapped to capture unexpected exceptions in Sentry.
	// Only the tool name is attached as context — arguments (user data) are never sent.
	for (const tool of tools) {
		const originalHandler = tool.handler;
		// biome-ignore lint/suspicious/noExplicitAny: tool handlers have heterogeneous input schemas
		const wrappedHandler: typeof originalHandler = async (args: any, extra: any) => {
			captureToolUsage(tool.name);
			try {
				return await originalHandler(args, extra);
			} catch (error) {
				captureToolError(tool.name, error);
				throw error;
			}
		};
		mcpServer.registerTool(tool.name, tool.config(), wrappedHandler);
	}

	// Register all prompts using McpServer.registerPrompt() in a loop
	for (const prompt of prompts) {
		mcpServer.registerPrompt(prompt.name, prompt.config(), prompt.handler);
	}

	return mcpServer;
}

/**
 * Configuration for transport selection
 */
interface TransportConfig {
	type: "stdio" | "http";
	port: number;
	host: string;
	corsOrigins: string[];
}

/**
 * Parse transport configuration from environment variables
 */
function getTransportConfig(): TransportConfig {
	const transportEnv = process.env.TRANSPORT?.toLowerCase() || "stdio";
	const type = (transportEnv === "http" ? "http" : "stdio") as "stdio" | "http";
	const port = Number.parseInt(process.env.PORT || "3000", 10);
	const host = process.env.HOST || "0.0.0.0";

	// Parse CORS origins from environment variable
	// Default origins: MCP Inspector UI (localhost:6274) and web-based Inspector (mcp.ziziyi.com)
	const defaultOrigins = ["http://localhost:6274", "https://mcp.ziziyi.com"];
	const corsOriginsEnv = process.env.CORS_ORIGINS;
	const corsOrigins = corsOriginsEnv
		? corsOriginsEnv.split(",").map((o) => o.trim())
		: defaultOrigins;

	return { type, port, host, corsOrigins };
}

/**
 * Wraps a ServerResponse to add SSE keep-alive functionality
 * When the response becomes an SSE stream, automatically sends ping messages every 15 seconds
 * @param res - The HTTP server response to wrap
 * @param req - The HTTP incoming request
 * @param keepAliveIntervalMs - Keep-alive ping interval in milliseconds (default: 15000ms = 15s)
 * @internal - Exported for testing purposes
 */
export function wrapResponseWithKeepAlive(
	res: http.ServerResponse,
	req: http.IncomingMessage,
	keepAliveIntervalMs = 15000,
): http.ServerResponse {
	let keepAliveInterval: NodeJS.Timeout | undefined;

	// Store original methods
	const originalWriteHead = res.writeHead.bind(res);
	const originalEnd = res.end.bind(res);

	// Override writeHead to detect SSE streams
	res.writeHead = ((
		statusCode: number,
		statusMessage?: string | http.OutgoingHttpHeaders,
		headers?: http.OutgoingHttpHeaders,
	): http.ServerResponse => {
		// Handle overloaded writeHead signature
		let finalHeaders: http.OutgoingHttpHeaders = {};

		if (typeof statusMessage === "object") {
			finalHeaders = statusMessage;
		} else if (headers) {
			finalHeaders = headers;
		}

		// Check if this is an SSE stream
		const contentType = finalHeaders["Content-Type"] || finalHeaders["content-type"];
		if (contentType === "text/event-stream") {
			logger.debug("SSE stream detected, enabling keep-alive", "KeepAlive");

			// Start keep-alive ping interval
			keepAliveInterval = setInterval(() => {
				try {
					if (!res.writableEnded) {
						res.write(":ping\n\n");
						logger.debug("Keep-alive ping sent", "KeepAlive");
					} else {
						// Stream ended, clear interval
						if (keepAliveInterval) {
							clearInterval(keepAliveInterval);
							keepAliveInterval = undefined;
						}
					}
				} catch (error) {
					logger.error(
						"Error sending keep-alive ping",
						"KeepAlive",
						error instanceof Error ? error : new Error(String(error)),
					);
					if (keepAliveInterval) {
						clearInterval(keepAliveInterval);
						keepAliveInterval = undefined;
					}
				}
			}, keepAliveIntervalMs);

			logger.info(`Keep-alive interval started (${keepAliveIntervalMs}ms)`, "KeepAlive");
		}

		// Call original writeHead
		if (typeof statusMessage === "string") {
			return originalWriteHead(statusCode, statusMessage, finalHeaders);
		}
		return originalWriteHead(statusCode, finalHeaders);
	}) as typeof res.writeHead;

	// Override end to clean up interval
	res.end = ((...args: Parameters<typeof originalEnd>): http.ServerResponse => {
		if (keepAliveInterval) {
			clearInterval(keepAliveInterval);
			keepAliveInterval = undefined;
			logger.info("Keep-alive interval stopped (response ended)", "KeepAlive");
		}
		return originalEnd(...args);
	}) as typeof res.end;

	// Clean up on connection close
	req.on("close", () => {
		if (keepAliveInterval) {
			clearInterval(keepAliveInterval);
			keepAliveInterval = undefined;
			logger.info("Keep-alive interval stopped (connection closed)", "KeepAlive");
		}
	});

	return res;
}

/**
 * Set CORS headers on HTTP response
 * @param req - The incoming HTTP request
 * @param res - The HTTP server response
 * @param allowedOrigins - Array of allowed origins
 * @internal - Exported for testing purposes
 */
export function setCorsHeaders(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	allowedOrigins: string[],
): void {
	const origin = req.headers.origin;

	// Check if origin is allowed
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	} else if (allowedOrigins.includes("*")) {
		res.setHeader("Access-Control-Allow-Origin", "*");
	}

	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

/**
 * Create and start HTTP server with SSE transport
 */
async function startHttpServer(config: TransportConfig): Promise<void> {
	return new Promise((resolve, reject) => {
		// Session management: track transports by session ID
		const transports = new Map<string, StreamableHTTPServerTransport>();

		const httpServer = http.createServer(async (req, res) => {
			try {
				// Set CORS headers for all requests
				setCorsHeaders(req, res, config.corsOrigins);

				// Handle OPTIONS preflight requests
				if (req.method === "OPTIONS") {
					res.writeHead(204);
					res.end();
					return;
				}

				// Health check endpoints
				if (req.url === "/health" && req.method === "GET") {
					// Liveness probe - is the server running?
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							status: "ok",
							service: "osm-tagging-schema-mcp",
							timestamp: new Date().toISOString(),
						}),
					);
					return;
				}

				if (req.url === "/ready" && req.method === "GET") {
					// Readiness probe - is the server ready to handle requests?
					try {
						// Check if schema is loaded by attempting a quick operation
						const schema = await schemaLoader.loadSchema();
						res.writeHead(200, { "Content-Type": "application/json" });
						res.end(
							JSON.stringify({
								status: "ready",
								service: "osm-tagging-schema-mcp",
								schema: {
									presets: Object.keys(schema.presets).length,
									fields: Object.keys(schema.fields).length,
									categories: Object.keys(schema.categories).length,
									version: schema.metadata?.version,
								},
								timestamp: new Date().toISOString(),
							}),
						);
					} catch (_error) {
						res.writeHead(503, { "Content-Type": "application/json" });
						res.end(
							JSON.stringify({
								status: "not_ready",
								error: "Schema not loaded",
								timestamp: new Date().toISOString(),
							}),
						);
					}
					return;
				}

				if (req.url === "/version" && req.method === "GET") {
					// Version endpoint - returns application version information
					const versionInfo = getVersionInfo();
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							version: versionInfo.version,
							buildTimestamp: versionInfo.buildTimestamp,
							service: "osm-tagging-schema-mcp",
						}),
					);
					return;
				}

				// Wrap response with keep-alive functionality for SSE streams
				const wrappedRes = wrapResponseWithKeepAlive(res, req);

				// Get session ID from header if present
				const sessionId =
					typeof req.headers["mcp-session-id"] === "string"
						? req.headers["mcp-session-id"]
						: undefined;

				let transport: StreamableHTTPServerTransport;

				// Check if this is an existing session
				if (sessionId && transports.has(sessionId)) {
					const existingTransport = transports.get(sessionId);
					if (!existingTransport) {
						throw new Error(`Transport not found for session: ${sessionId}`);
					}
					transport = existingTransport;
				} else {
					// Create a new MCP server instance per session.
					// A single McpServer instance can only be connected to one transport at a
					// time — reusing it across connections causes "Already connected to a
					// transport" errors when a second client connects.
					const sessionServer = createServer();

					// Create new transport for new session (stateful mode)
					transport = new StreamableHTTPServerTransport({
						sessionIdGenerator: () => randomUUID(),
						onsessioninitialized: (newSessionId: string) => {
							logger.info(`Session initialized: ${newSessionId}`, "HttpServer");
							transports.set(newSessionId, transport);
						},
						onsessionclosed: (closedSessionId: string) => {
							logger.info(`Session closed: ${closedSessionId}`, "HttpServer");
							transports.delete(closedSessionId);
						},
					});

					// Connect this session's dedicated server to its transport
					await sessionServer.connect(transport);
				}

				// Handle the HTTP request with wrapped response
				await transport.handleRequest(req, wrappedRes);
			} catch (error) {
				logger.error(
					"Error handling HTTP request",
					"HttpServer",
					error instanceof Error ? error : new Error(String(error)),
				);
				if (!res.headersSent) {
					res.writeHead(500);
					res.end(JSON.stringify({ error: "Internal server error" }));
				}
			}
		});

		httpServer.on("error", (error) => {
			logger.error("HTTP server error", "HttpServer", error);
			reject(error);
		});

		httpServer.listen(config.port, config.host, () => {
			const versionInfo = getVersionInfo();
			logger.info(
				`OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)} running on http://${config.host}:${config.port}`,
				"main",
			);
			logger.info(`CORS enabled for origins: ${config.corsOrigins.join(", ")}`, "main");
			console.error(
				`OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)} running on http://${config.host}:${config.port}`,
			);
			console.error(`CORS enabled for origins: ${config.corsOrigins.join(", ")}`);
			resolve();
		});
	});
}

/**
 * Main entry point
 */
async function main() {
	const config = getTransportConfig();

	// Initialise Sentry before any async operations so startup errors are captured.
	// Safe no-op when SENTRY_DSN is not set.
	if (initSentry(config.type)) {
		logger.info("Sentry error monitoring enabled", "main");
	}

	// Graceful shutdown: flush Sentry events before the process exits.
	// Without this, SIGTERM/SIGINT (e.g. MCP client disconnect) kills the
	// process while events are still buffered, causing silent data loss.
	const handleShutdownSignal = async (signal: string) => {
		logger.info(`Received ${signal}, shutting down…`, "main");
		await closeSentry();
		process.exit(0);
	};

	process.on("SIGTERM", () => handleShutdownSignal("SIGTERM"));
	process.on("SIGINT", () => handleShutdownSignal("SIGINT"));

	const versionInfo = getVersionInfo();
	logger.info(`Starting OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)}`, "main");
	logger.info(`Transport: ${config.type}`, "main");

	// Warmup: Preload schema and build indexes before accepting requests
	// This eliminates initial latency on first tool call
	logger.info("Preloading schema and building indexes...", "main");
	try {
		await schemaLoader.warmup();
		captureStartupEvent("schema_warmup", true);
	} catch (error) {
		captureStartupEvent(
			"schema_warmup",
			false,
			error instanceof Error ? error : new Error(String(error)),
		);
		throw error;
	}
	logger.info("Schema preloaded successfully", "main");

	// Start appropriate transport
	if (config.type === "http") {
		await startHttpServer(config);
	} else {
		// Create server for stdio — one connection, one server instance
		const server = createServer();
		const transport = new StdioServerTransport();
		await server.connect(transport);
		logger.info(
			`OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)} running on stdio`,
			"main",
		);
		console.error(
			`OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)} running on stdio`,
		);
	}
}

// Run if this is the main module
// Check if the file is being run directly (not imported as a module)
// Resolve symlinks to handle npm bin wrappers (e.g., node_modules/.bin/osm-tagging-mcp)
const isMainModule = (() => {
	if (!process.argv[1]) return false;

	// Resolve the symlink if argv[1] is a symlink (common for npm bin scripts)
	let resolvedArgv: string;
	try {
		resolvedArgv = realpathSync(process.argv[1]);
	} catch {
		// If realpath fails, use original path
		resolvedArgv = process.argv[1];
	}

	return (
		import.meta.url === `file://${resolvedArgv}` ||
		import.meta.url.endsWith(resolvedArgv) ||
		resolvedArgv.endsWith("index.js")
	);
})();

if (isMainModule) {
	main().catch(async (error) => {
		const err = error instanceof Error ? error : new Error(String(error));
		captureStartupEvent("fatal", false, err);
		logger.error("Fatal server error", "main", err);
		console.error("Server error:", error);
		await closeSentry();
		process.exit(1);
	});
}
