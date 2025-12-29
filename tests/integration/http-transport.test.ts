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

	describe("StreamableHTTPServerTransport Integration", () => {
		it("should reject GET requests without Accept: text/event-stream header", async () => {
			const { StreamableHTTPServerTransport } = await import(
				"@modelcontextprotocol/sdk/server/streamableHttp.js"
			);
			const { randomUUID } = await import("node:crypto");
			const { EventEmitter } = await import("node:events");

			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
			});

			let statusCode = 0;
			const headers: Record<string, string | string[]> = {};

			// Create a proper mock request that extends EventEmitter
			const mockReq = Object.assign(new EventEmitter(), {
				method: "GET",
				url: "/mcp",
				headers: {
					accept: "application/json", // Wrong Accept header
				},
				httpVersion: "1.1",
				socket: new EventEmitter(),
			}) as http.IncomingMessage;

			// Create a proper mock response with all necessary methods
			const mockRes = Object.assign(new EventEmitter(), {
				writeHead(code: number, _headers?: Record<string, string | string[]>) {
					statusCode = code;
					if (_headers) {
						Object.assign(headers, _headers);
					}
					return this;
				},
				setHeader(name: string, value: string | string[]) {
					headers[name] = value;
				},
				getHeader(name: string) {
					return headers[name];
				},
				end() {
					return this;
				},
				write() {
					return true;
				},
				headersSent: false,
				writableEnded: false,
			}) as unknown as http.ServerResponse;

			await transport.handleRequest(mockReq, mockRes);

			assert.strictEqual(statusCode, 406, "Should return 406 Not Acceptable");
		});

		it("should accept POST requests with proper headers", async () => {
			const { StreamableHTTPServerTransport } = await import(
				"@modelcontextprotocol/sdk/server/streamableHttp.js"
			);
			const { randomUUID } = await import("node:crypto");
			const { EventEmitter } = await import("node:events");
			const { Readable } = await import("node:stream");

			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
			});

			let statusCode = 0;
			const headers: Record<string, string | string[]> = {};

			const initRequest = {
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: { name: "test", version: "1.0" },
				},
			};

			// Create a readable stream with the request body
			const requestBody = JSON.stringify(initRequest);
			const bodyStream = Readable.from([requestBody]);

			// Create a proper mock request that extends the readable stream
			const mockReq = Object.assign(bodyStream, {
				method: "POST",
				url: "/mcp",
				headers: {
					"content-type": "application/json",
					accept: "application/json, text/event-stream",
					"content-length": Buffer.byteLength(requestBody).toString(),
				},
				httpVersion: "1.1",
				socket: new EventEmitter(),
			}) as http.IncomingMessage;

			// Create a proper mock response with all necessary methods
			const mockRes = Object.assign(new EventEmitter(), {
				writeHead(code: number, _headers?: Record<string, string | string[]>) {
					statusCode = code;
					if (_headers) {
						Object.assign(headers, _headers);
					}
					return this;
				},
				setHeader(name: string, value: string | string[]) {
					headers[name] = value;
				},
				getHeader(name: string) {
					return headers[name];
				},
				end() {
					return this;
				},
				write() {
					return true;
				},
				headersSent: false,
				writableEnded: false,
				flushHeaders() {},
			}) as unknown as http.ServerResponse;

			// We expect this to not throw
			await transport.handleRequest(mockReq, mockRes);

			// The transport should accept the request (status 200 for HTTP stream)
			assert.ok(
				statusCode === 200 || statusCode === 202,
				`Should return 200 or 202, got ${statusCode}`,
			);
		});

		it("should generate and track session IDs", async () => {
			const { StreamableHTTPServerTransport } = await import(
				"@modelcontextprotocol/sdk/server/streamableHttp.js"
			);
			const { randomUUID } = await import("node:crypto");
			const { EventEmitter } = await import("node:events");
			const { Readable } = await import("node:stream");

			let generatedSessionId: string | undefined;

			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: (sessionId: string) => {
					generatedSessionId = sessionId;
				},
			});

			const initRequest = {
				jsonrpc: "2.0",
				id: 1,
				method: "initialize",
				params: {
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: { name: "test", version: "1.0" },
				},
			};

			// Create a readable stream with the request body
			const requestBody = JSON.stringify(initRequest);
			const bodyStream = Readable.from([requestBody]);

			// Create a proper mock request that extends the readable stream
			const mockReq = Object.assign(bodyStream, {
				method: "POST",
				url: "/mcp",
				headers: {
					"content-type": "application/json",
					accept: "application/json, text/event-stream",
					"content-length": Buffer.byteLength(requestBody).toString(),
				},
				httpVersion: "1.1",
				socket: new EventEmitter(),
			}) as http.IncomingMessage;

			const headers: Record<string, string | string[]> = {};

			// Create a proper mock response with all necessary methods
			const mockRes = Object.assign(new EventEmitter(), {
				writeHead(_code: number, _headers?: Record<string, string | string[]>) {
					if (_headers) {
						Object.assign(headers, _headers);
					}
					return this;
				},
				setHeader(name: string, value: string | string[]) {
					headers[name] = value;
				},
				getHeader(name: string) {
					return headers[name];
				},
				end() {
					return this;
				},
				write() {
					return true;
				},
				headersSent: false,
				writableEnded: false,
				flushHeaders() {},
			}) as unknown as http.ServerResponse;

			await transport.handleRequest(mockReq, mockRes);

			// Session ID should be generated
			assert.ok(generatedSessionId, "Session ID should be generated");
			assert.strictEqual(typeof generatedSessionId, "string");
			// UUID format check
			assert.ok(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(generatedSessionId),
				"Session ID should be a valid UUID",
			);
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

		it(
			"should clean up keep-alive interval when connection closes",
			{ timeout: 5000 },
			async () => {
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
			},
		);
	});
});
