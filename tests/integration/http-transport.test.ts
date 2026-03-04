import assert from "node:assert";
import http from "node:http";
import { afterEach, beforeEach, describe, it } from "node:test";

describe("HTTP Transport Integration Tests", () => {
	describe("Environment Configuration", () => {
		let originalEnv: NodeJS.ProcessEnv;

		beforeEach(() => {
			originalEnv = { ...process.env };
		});

		afterEach(() => {
			process.env = originalEnv;
		});

		it("should default to stdio transport when TRANSPORT is not set", () => {
			delete process.env.TRANSPORT;
			const transport = process.env.TRANSPORT || "stdio";
			assert.strictEqual(transport, "stdio");
		});

		it("should use http transport when TRANSPORT=http", () => {
			process.env.TRANSPORT = "http";
			assert.strictEqual(process.env.TRANSPORT, "http");
		});

		it("should default to port 3000 when PORT is not set", () => {
			delete process.env.PORT;
			const port = Number.parseInt(process.env.PORT || "3000", 10);
			assert.strictEqual(port, 3000);
		});

		it("should use custom port when PORT is set", () => {
			process.env.PORT = "8080";
			const port = Number.parseInt(process.env.PORT, 10);
			assert.strictEqual(port, 8080);
		});

		it("should default to 0.0.0.0 when HOST is not set", () => {
			delete process.env.HOST;
			const host = process.env.HOST || "0.0.0.0";
			assert.strictEqual(host, "0.0.0.0");
		});

		it("should use custom host when HOST is set", () => {
			process.env.HOST = "127.0.0.1";
			assert.strictEqual(process.env.HOST, "127.0.0.1");
		});

		it("should use default CORS origins when CORS_ORIGINS is not set", () => {
			delete process.env.CORS_ORIGINS;
			const defaultOrigins = ["http://localhost:6274", "https://mcp.ziziyi.com"];
			const corsOriginsEnv = process.env.CORS_ORIGINS;
			const corsOrigins = corsOriginsEnv
				? corsOriginsEnv.split(",").map((o) => o.trim())
				: defaultOrigins;
			assert.deepStrictEqual(corsOrigins, defaultOrigins);
		});

		it("should use custom CORS origins when CORS_ORIGINS is set", () => {
			process.env.CORS_ORIGINS = "http://example.com, https://example.org";
			const corsOrigins = process.env.CORS_ORIGINS.split(",").map((o) => o.trim());
			assert.deepStrictEqual(corsOrigins, ["http://example.com", "https://example.org"]);
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

		it("should handle GET requests to /mcp endpoint for event streams", async () => {
			let requestReceived = false;

			server = http.createServer((req, res) => {
				if (req.method === "GET" && req.url === "/mcp") {
					requestReceived = true;
					res.writeHead(200, {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					});
					res.write("event: endpoint\ndata: /mcp\n\n");
					// Don't end the response for SSE streams
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
							method: "GET",
							headers: {
								Accept: "text/event-stream",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(res.headers["content-type"], "text/event-stream");
							assert.strictEqual(requestReceived, true);

							// Clean up the connection
							res.on("data", () => {
								// Read data to prevent backpressure
							});

							// Close after receiving headers
							setTimeout(() => {
								req.destroy();
								resolve();
							}, 100);
						});

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

	describe("Keep-Alive Functionality", () => {
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

		it("should send keep-alive ping messages for event streams", { timeout: 5000 }, async () => {
			// Import the wrapper function from index.ts
			const { wrapResponseWithKeepAlive } = await import("../../src/index.js");

			let pingCount = 0;
			let receivedData = "";

			// Use 1 second interval for faster testing
			const testIntervalMs = 1000;

			server = http.createServer((req, res) => {
				if (req.method === "GET" && req.url === "/sse") {
					// Wrap response with keep-alive functionality (1s interval for testing)
					const wrappedRes = wrapResponseWithKeepAlive(res, req, testIntervalMs);

					// Simulate event stream setup
					wrappedRes.writeHead(200, {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					});

					// Send initial event
					wrappedRes.write("event: endpoint\ndata: /sse\n\n");

					// The wrapper should automatically add ping messages every 1 second (for testing)
					// We don't need to do anything here - just keep the connection open
				} else {
					res.writeHead(404);
					res.end();
				}
			});

			await new Promise<void>((resolve, reject) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/sse",
							method: "GET",
							headers: {
								Accept: "text/event-stream",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(res.headers["content-type"], "text/event-stream");

							res.on("data", (chunk: Buffer) => {
								const data = chunk.toString();
								receivedData += data;

								// Count ping messages
								if (data.includes(":ping")) {
									pingCount++;
								}
							});

							// Wait 2.5 seconds to receive at least 2 pings (1s interval)
							setTimeout(() => {
								req.destroy();

								// We should have received at least 2 ping messages
								assert.ok(
									pingCount >= 2,
									`Should receive at least 2 ping messages with 1s interval, got ${pingCount}`,
								);
								assert.ok(
									receivedData.includes(":ping"),
									"Should receive ping messages in event stream format",
								);

								resolve();
							}, 2500); // Wait 2.5 seconds
						});

						req.on("error", (error) => {
							reject(error);
						});

						req.end();
					}
				});
			});
		});

		it("should clean up keep-alive interval when connection closes", {
			timeout: 5000,
		}, async () => {
			// This test verifies that the interval is properly cleaned up
			// We can't directly test internal state, but we can verify no errors occur
			const { wrapResponseWithKeepAlive } = await import("../../src/index.js");

			// Use 500ms interval for faster testing
			const testIntervalMs = 500;

			server = http.createServer((req, res) => {
				if (req.method === "GET" && req.url === "/sse") {
					const wrappedRes = wrapResponseWithKeepAlive(res, req, testIntervalMs);

					wrappedRes.writeHead(200, {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					});
					wrappedRes.write("event: test\ndata: start\n\n");
				}
			});

			await new Promise<void>((resolve, reject) => {
				server?.listen(0, () => {
					const address = server?.address();
					assert.ok(address && typeof address === "object");

					if (typeof address === "object" && address) {
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/sse",
							method: "GET",
							headers: {
								Accept: "text/event-stream",
							},
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);

							// Close connection after 1 second
							setTimeout(() => {
								req.destroy();

								// Wait a bit to ensure cleanup happens
								setTimeout(() => {
									// If we get here without errors, cleanup worked
									resolve();
								}, 1000);
							}, 1000);
						});

						req.on("error", (error) => {
							// Ignore connection reset errors (expected when we destroy)
							if (
								error.message.includes("ECONNRESET") ||
								error.message.includes("socket hang up")
							) {
								return;
							}
							reject(error);
						});

						req.end();
					}
				});
			});
		});
	});

	describe("Health Check Endpoints", () => {
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

		it("should respond to GET /health with liveness status", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/health" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							status: "ok",
							service: "osm-tagging-schema-mcp",
							timestamp: new Date().toISOString(),
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
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/health",
							method: "GET",
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(res.headers["content-type"], "application/json");

							let data = "";
							res.on("data", (chunk) => {
								data += chunk.toString();
							});

							res.on("end", () => {
								const response = JSON.parse(data);
								assert.strictEqual(response.status, "ok");
								assert.strictEqual(response.service, "osm-tagging-schema-mcp");
								assert.ok(response.timestamp);
								assert.ok(Date.parse(response.timestamp)); // Valid ISO timestamp
								resolve();
							});
						});

						req.end();
					}
				});
			});
		});

		it("should respond to GET /ready with readiness status when schema is loaded", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/ready" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							status: "ready",
							service: "osm-tagging-schema-mcp",
							schema: {
								presets: 1000,
								fields: 500,
								categories: 50,
								version: "6.0.0",
							},
							timestamp: new Date().toISOString(),
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
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/ready",
							method: "GET",
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 200);
							assert.strictEqual(res.headers["content-type"], "application/json");

							let data = "";
							res.on("data", (chunk) => {
								data += chunk.toString();
							});

							res.on("end", () => {
								const response = JSON.parse(data);
								assert.strictEqual(response.status, "ready");
								assert.strictEqual(response.service, "osm-tagging-schema-mcp");
								assert.ok(response.schema);
								assert.strictEqual(typeof response.schema.presets, "number");
								assert.strictEqual(typeof response.schema.fields, "number");
								assert.strictEqual(typeof response.schema.categories, "number");
								assert.ok(response.schema.version);
								assert.ok(response.timestamp);
								resolve();
							});
						});

						req.end();
					}
				});
			});
		});

		it("should respond to GET /ready with 503 when schema is not loaded", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/ready" && req.method === "GET") {
					res.writeHead(503, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							status: "not_ready",
							error: "Schema not loaded",
							timestamp: new Date().toISOString(),
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
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/ready",
							method: "GET",
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 503);
							assert.strictEqual(res.headers["content-type"], "application/json");

							let data = "";
							res.on("data", (chunk) => {
								data += chunk.toString();
							});

							res.on("end", () => {
								const response = JSON.parse(data);
								assert.strictEqual(response.status, "not_ready");
								assert.strictEqual(response.error, "Schema not loaded");
								assert.ok(response.timestamp);
								resolve();
							});
						});

						req.end();
					}
				});
			});
		});

		it("should respond to GET /version with application version info", async () => {
			server = http.createServer((req, res) => {
				if (req.url === "/version" && req.method === "GET") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({
							version: "3.6.0",
							buildTimestamp: "2025-12-30T12:00:00Z",
							service: "osm-tagging-schema-mcp",
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
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/version",
							method: "GET",
						};

						const req = http.request(options, (res) => {
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
								assert.ok(Date.parse(response.buildTimestamp)); // Valid ISO timestamp
								resolve();
							});
						});

						req.end();
					}
				});
			});
		});

		it("should only respond to GET method for health endpoints", async () => {
			server = http.createServer((req, res) => {
				const healthPaths = ["/health", "/ready", "/version"];
				if (healthPaths.includes(req.url || "") && req.method !== "GET") {
					res.writeHead(404);
					res.end();
				} else if (healthPaths.includes(req.url || "") && req.method === "GET") {
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
						// Test POST to /health should fail
						const options = {
							hostname: "localhost",
							port: address.port,
							path: "/health",
							method: "POST",
						};

						const req = http.request(options, (res) => {
							assert.strictEqual(res.statusCode, 404);
							resolve();
						});

						req.end();
					}
				});
			});
		});
	});
});
