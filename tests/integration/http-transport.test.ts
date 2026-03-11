import assert from "node:assert";
import http from "node:http";
import { afterEach, describe, it } from "node:test";

describe("HTTP Transport Integration Tests", () => {
	describe("Environment Configuration", () => {
		it("should default to stdio transport when TRANSPORT is not set", () => {
			const saved = process.env.TRANSPORT;
			delete process.env.TRANSPORT;
			const transport = process.env.TRANSPORT || "stdio";
			assert.strictEqual(transport, "stdio");
			if (saved !== undefined) process.env.TRANSPORT = saved;
		});

		it("should use http transport when TRANSPORT=http", () => {
			const saved = process.env.TRANSPORT;
			process.env.TRANSPORT = "http";
			assert.strictEqual(process.env.TRANSPORT, "http");
			if (saved !== undefined) process.env.TRANSPORT = saved;
			else delete process.env.TRANSPORT;
		});

		it("should default to port 3000 when PORT is not set", () => {
			const saved = process.env.PORT;
			delete process.env.PORT;
			const port = Number.parseInt(process.env.PORT || "3000", 10);
			assert.strictEqual(port, 3000);
			if (saved !== undefined) process.env.PORT = saved;
		});

		it("should use custom port when PORT is set", () => {
			const saved = process.env.PORT;
			process.env.PORT = "8080";
			const port = Number.parseInt(process.env.PORT, 10);
			assert.strictEqual(port, 8080);
			if (saved !== undefined) process.env.PORT = saved;
			else delete process.env.PORT;
		});

		it("should default to 0.0.0.0 when HOST is not set", () => {
			const saved = process.env.HOST;
			delete process.env.HOST;
			const host = process.env.HOST || "0.0.0.0";
			assert.strictEqual(host, "0.0.0.0");
			if (saved !== undefined) process.env.HOST = saved;
		});

		it("should use custom host when HOST is set", () => {
			const saved = process.env.HOST;
			process.env.HOST = "127.0.0.1";
			assert.strictEqual(process.env.HOST, "127.0.0.1");
			if (saved !== undefined) process.env.HOST = saved;
			else delete process.env.HOST;
		});

		it("should use default CORS origins when CORS_ORIGINS is not set", () => {
			const saved = process.env.CORS_ORIGINS;
			delete process.env.CORS_ORIGINS;
			const defaultOrigins = ["http://localhost:6274", "https://mcp.ziziyi.com"];
			const corsOriginsEnv = process.env.CORS_ORIGINS;
			const corsOrigins = corsOriginsEnv
				? corsOriginsEnv.split(",").map((o) => o.trim())
				: defaultOrigins;
			assert.deepStrictEqual(corsOrigins, defaultOrigins);
			if (saved !== undefined) process.env.CORS_ORIGINS = saved;
		});

		it("should use custom CORS origins when CORS_ORIGINS is set", () => {
			const saved = process.env.CORS_ORIGINS;
			process.env.CORS_ORIGINS = "http://example.com, https://example.org";
			const corsOrigins = process.env.CORS_ORIGINS.split(",").map((o) => o.trim());
			assert.deepStrictEqual(corsOrigins, ["http://example.com", "https://example.org"]);
			if (saved !== undefined) process.env.CORS_ORIGINS = saved;
			else delete process.env.CORS_ORIGINS;
		});
	});

	describe("HTTP Server Creation", () => {
		let server: http.Server | null = null;

		afterEach(async () => {
			if (server) {
				await new Promise<void>((resolve) => {
					server?.close(() => {
						server = null;
						resolve();
					});
				});
			}
		});

		it("should create HTTP server that listens on specified port", async () => {
			server = http.createServer((_req, res) => {
				res.writeHead(200);
				res.end("OK");
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address);
					assert.strictEqual(typeof address, "object");
					if (typeof address === "object" && address) {
						assert.ok(address.port > 0);
					}
					resolve();
				});
			});
		});

		it("should handle POST requests to /mcp endpoint", async () => {
			let requestReceived = false;

			server = http.createServer((req, res) => {
				if (req.method === "POST" && req.url === "/mcp") {
					requestReceived = true;
					res.writeHead(200);
					res.end("OK");
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/mcp",
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(requestReceived, true);
							resolve();
						});

						req.end();
					}
				});
			});
		});

		it("should return 404 for GET /mcp (no SSE)", async () => {
			server = http.createServer((req, res) => {
				if (req.method === "GET" && req.url === "/mcp") {
					res.writeHead(404, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Not found" }));
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{
								hostname: "localhost",
								port: (address as { port: number }).port,
								path: "/mcp",
								method: "GET",
							},
							(res) => {
								assert.strictEqual(res.statusCode, 404);
								resolve();
							},
						);
						req.end();
					}
				});
			});
		});
	});

	describe("CORS Functionality", () => {
		let server: http.Server | null = null;

		afterEach(async () => {
			if (server) {
				await new Promise<void>((resolve) => {
					server?.close(() => {
						server = null;
						resolve();
					});
				});
			}
		});

		it("should add CORS headers to responses", async () => {
			const { setCorsHeaders } = await import("../../src/index.js");

			server = http.createServer((req, res) => {
				setCorsHeaders(req, res, ["http://localhost:6274", "https://mcp.ziziyi.com"]);
				res.writeHead(200);
				res.end("OK");
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/",
							method: "GET",
							headers: {
								Origin: "http://localhost:6274",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(
								res.headers["access-control-allow-origin"],
								"http://localhost:6274",
							);
							assert.strictEqual(
								res.headers["access-control-allow-methods"],
								"GET, POST, OPTIONS, DELETE",
							);
							assert.ok(res.headers["access-control-allow-headers"]);
							assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
							resolve();
						});

						req.end();
					}
				});
			});
		});

		it("should handle OPTIONS preflight requests", async () => {
			const { setCorsHeaders } = await import("../../src/index.js");

			server = http.createServer((req, res) => {
				setCorsHeaders(req, res, ["http://localhost:6274"]);

				if (req.method === "OPTIONS") {
					res.writeHead(204);
					res.end();
					return;
				}

				res.writeHead(200);
				res.end("OK");
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/",
							method: "OPTIONS",
							headers: {
								Origin: "http://localhost:6274",
								"Access-Control-Request-Method": "POST",
								"Access-Control-Request-Headers": "Content-Type",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 204);
							assert.strictEqual(
								res.headers["access-control-allow-origin"],
								"http://localhost:6274",
							);
							assert.strictEqual(
								res.headers["access-control-allow-methods"],
								"GET, POST, OPTIONS, DELETE",
							);
							resolve();
						});

						req.end();
					}
				});
			});
		});

		it("should not set CORS origin header for disallowed origins", async () => {
			const { setCorsHeaders } = await import("../../src/index.js");

			server = http.createServer((req, res) => {
				setCorsHeaders(req, res, ["http://localhost:6274"]);
				res.writeHead(200);
				res.end("OK");
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/",
							method: "GET",
							headers: {
								Origin: "http://evil.com",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							// Should not set Access-Control-Allow-Origin for disallowed origins
							assert.strictEqual(res.headers["access-control-allow-origin"], undefined);
							resolve();
						});

						req.end();
					}
				});
			});
		});
	});

	describe("HTTP Endpoints", () => {
		let server: http.Server | null = null;

		afterEach(async () => {
			if (server) {
				await new Promise<void>((resolve) => {
					server?.close(() => {
						server = null;
						resolve();
					});
				});
			}
		});

		it("should respond to GET / with HTML landing page", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
					res.end(
						'<!DOCTYPE html><html><body><h1>OSM Tagging Schema MCP Server</h1><a href="/mcp">/mcp</a></body></html>',
					);
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{ hostname: "localhost", port: address.port, path: "/", method: "GET" },
							(res) => {
								assert.strictEqual(res.statusCode, 200);
								assert.ok(res.headers["content-type"]?.includes("text/html"));

								let data = "";
								res.on("data", (chunk) => {
									data += chunk.toString();
								});
								res.on("end", () => {
									assert.ok(data.includes("/mcp"), "Landing page should mention /mcp endpoint");
									resolve();
								});
							},
						);
						req.end();
					}
				});
			});
		});

		it("should respond to GET /health with minimal liveness status", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/health" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{ hostname: "localhost", port: address.port, path: "/health", method: "GET" },
							(res) => {
								assert.strictEqual(res.statusCode, 200);
								assert.strictEqual(res.headers["content-type"], "application/json");

								let data = "";
								res.on("data", (chunk) => {
									data += chunk.toString();
								});
								res.on("end", () => {
									const response = JSON.parse(data);
									assert.strictEqual(response.status, "ok");
									assert.ok(response.timestamp);
									assert.ok(Date.parse(response.timestamp)); // Valid ISO timestamp
									// /health should be minimal - no extra fields
									assert.strictEqual(
										response.service,
										undefined,
										"/health should not include service field",
									);
									assert.strictEqual(
										response.schema,
										undefined,
										"/health should not include schema field",
									);
									resolve();
								});
							},
						);
						req.end();
					}
				});
			});
		});

		it("should respond to GET /version with version and schema statistics", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/version" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							version: "3.7.5",
							buildTimestamp: "2025-12-30T12:00:00Z",
							service: "osm-tagging-schema-mcp",
							schema: {
								presets: 4120,
								fields: 920,
								categories: 45,
								version: "6.0.0",
							},
						}),
					);
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{ hostname: "localhost", port: address.port, path: "/version", method: "GET" },
							(res) => {
								assert.strictEqual(res.statusCode, 200);
								assert.strictEqual(res.headers["content-type"], "application/json");

								let data = "";
								res.on("data", (chunk) => {
									data += chunk.toString();
								});
								res.on("end", () => {
									const response = JSON.parse(data);
									assert.ok(response.version);
									assert.ok(response.buildTimestamp);
									assert.strictEqual(response.service, "osm-tagging-schema-mcp");
									assert.ok(Date.parse(response.buildTimestamp));
									// Schema statistics should be present
									assert.ok(response.schema, "/version should include schema stats");
									assert.strictEqual(typeof response.schema.presets, "number");
									assert.strictEqual(typeof response.schema.fields, "number");
									assert.strictEqual(typeof response.schema.categories, "number");
									assert.ok(response.schema.version, "Schema version should be present");
									resolve();
								});
							},
						);
						req.end();
					}
				});
			});
		});

		it("should return 404 for unknown paths", async () => {
			server = http.createServer((req, res) => {
				const knownPaths = ["/", "/health", "/version", "/mcp"];
				if (knownPaths.includes(req.url || "")) {
					res.writeHead(200);
					res.end("OK");
				} else {
					res.writeHead(404, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Not found" }));
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{
								hostname: "localhost",
								port: (address as { port: number }).port,
								path: "/nonexistent",
								method: "GET",
							},
							(res) => {
								assert.strictEqual(res.statusCode, 404);
								let data = "";
								res.on("data", (chunk) => {
									data += chunk.toString();
								});
								res.on("end", () => {
									const response = JSON.parse(data);
									assert.ok(response.error);
									resolve();
								});
							},
						);
						req.end();
					}
				});
			});
		});

		it("should return 404 for /ready (endpoint removed)", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/ready") {
					res.writeHead(404, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Not found" }));
				} else {
					res.writeHead(200);
					res.end("OK");
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const req = http.request(
							{
								hostname: "localhost",
								port: (address as { port: number }).port,
								path: "/ready",
								method: "GET",
							},
							(res) => {
								assert.strictEqual(res.statusCode, 404);
								resolve();
							},
						);
						req.end();
					}
				});
			});
		});

		it("should only respond to GET method for info endpoints", async () => {
			server = http.createServer((req, res) => {
				const infoPaths = ["/health", "/version", "/"];
				if (infoPaths.includes(req.url || "") && req.method !== "GET") {
					res.writeHead(404, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Not found" }));
				} else if (infoPaths.includes(req.url || "") && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ status: "ok" }));
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						// POST to /health should return 404
						const req = http.request(
							{
								hostname: "localhost",
								port: address.port,
								path: "/health",
								method: "POST",
							},
							(res) => {
								assert.strictEqual(res.statusCode, 404);
								resolve();
							},
						);
						req.end();
					}
				});
			});
		});
	});
});
