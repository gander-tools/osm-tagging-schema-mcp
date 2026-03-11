#!/usr/bin/env node
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

	// Register all tools using McpServer.registerTool() in a loop
	for (const tool of tools) {
		mcpServer.registerTool(tool.name, tool.config(), tool.handler);
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
 * Build the HTML landing page for the HTTP server
 */
function buildLandingPage(version: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OSM Tagging Schema MCP Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 3rem auto; padding: 0 1rem; color: #222; }
    h1 { font-size: 1.5rem; }
    code { background: #f4f4f4; padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.9em; }
    ul { line-height: 2; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>OSM Tagging Schema MCP Server</h1>
  <p>Version: <code>${version}</code></p>
  <p>
    MCP server for querying and validating
    <a href="https://wiki.openstreetmap.org/wiki/Tags">OpenStreetMap tags</a>.
  </p>
  <h2>Endpoints</h2>
  <ul>
    <li><code>POST <a href="/mcp">/mcp</a></code> &mdash; MCP protocol (JSON-RPC)</li>
    <li><code>GET <a href="/health">/health</a></code> &mdash; Health check</li>
    <li><code>GET <a href="/version">/version</a></code> &mdash; Version &amp; schema info</li>
  </ul>
  <p>
    <a href="https://github.com/gander-tools/osm-tagging-schema-mcp">GitHub</a>
  </p>
</body>
</html>`;
}

/**
 * Create and start HTTP server with stateless MCP transport
 */
async function startHttpServer(config: TransportConfig): Promise<void> {
	// Create MCP server and transport ONCE at startup and reuse for all requests.
	// In stateless mode (sessionIdGenerator: undefined) each handleRequest() call
	// is fully independent — req/res are the only per-request state — so a single
	// shared transport instance handles concurrent POSTs safely without leaking.
	const mcpServer = createServer();
	const mcpTransport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined, // stateless: no session tracking
	});
	await mcpServer.connect(mcpTransport);

	return new Promise((resolve, reject) => {
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

				// GET / - HTML landing page
				if (req.url === "/" && req.method === "GET") {
					const versionInfo = getVersionInfo();
					res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
					res.end(buildLandingPage(versionInfo.version));
					return;
				}

				// GET /health - liveness probe
				if (req.url === "/health" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
					return;
				}

				// GET /version - version info + schema statistics
				if (req.url === "/version" && req.method === "GET") {
					const versionInfo = getVersionInfo();
					const schema = await schemaLoader.loadSchema();
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							version: versionInfo.version,
							buildTimestamp: versionInfo.buildTimestamp,
							service: "osm-tagging-schema-mcp",
							schema: {
								presets: Object.keys(schema.presets).length,
								fields: Object.keys(schema.fields).length,
								categories: Object.keys(schema.categories).length,
								version: schema.metadata?.version,
							},
						}),
					);
					return;
				}

				// POST /mcp - MCP protocol endpoint (stateless)
				if (req.url === "/mcp" && req.method === "POST") {
					await mcpTransport.handleRequest(req, res);
					return;
				}

				// 404 for all other paths
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Not found" }));
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

		httpServer.on("close", () => {
			mcpTransport.close().catch((err) => {
				logger.error(
					"Error closing MCP transport",
					"HttpServer",
					err instanceof Error ? err : new Error(String(err)),
				);
			});
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
			logger.info(`MCP endpoint: http://${config.host}:${config.port}/mcp`, "main");
			logger.info(`CORS enabled for origins: ${config.corsOrigins.join(", ")}`, "main");
			console.error(
				`OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)} running on http://${config.host}:${config.port}`,
			);
			console.error(`MCP endpoint: http://${config.host}:${config.port}/mcp`);
			resolve();
		});
	});
}

/**
 * Main entry point
 */
async function main() {
	const config = getTransportConfig();

	const versionInfo = getVersionInfo();
	logger.info(`Starting OSM Tagging Schema MCP Server ${formatVersionInfo(versionInfo)}`, "main");
	logger.info(`Transport: ${config.type}`, "main");

	// Warmup: Preload schema and build indexes before accepting requests
	// This eliminates initial latency on first tool call
	logger.info("Preloading schema and building indexes...", "main");
	await schemaLoader.warmup();
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
	main().catch((error) => {
		logger.error(
			"Fatal server error",
			"main",
			error instanceof Error ? error : new Error(String(error)),
		);
		console.error("Server error:", error);
		process.exit(1);
	});
}
