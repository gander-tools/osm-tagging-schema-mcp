/**
 * taginfo snapshot runner - NOT part of `npm test` (file is deliberately not *.test.ts).
 *
 * Replays tests/fixtures/taginfo/<snapshot>/<tool>.json through the in-memory MCP server and writes
 * report.json next to the fixtures (tagged with the git commit that was tested, not a package version). Only crashes fail the run; everything else is statistics:
 *   - invalid cases: how many the tool "detected" (isError, or flagged / empty result, see detected())
 *   - valid cases:   how many returned an error (possible false positives)
 *
 * Usage: npm run test:taginfo                       (latest snapshot)
 *        TAGINFO_SNAPSHOT=2026-10-01 npm run test:taginfo
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
	setupClientServer,
	type TestServer,
	teardownClientServer,
} from "../integration/helpers.js";

const FIXTURES = new URL("../fixtures/taginfo/", import.meta.url);
const META_FIELDS = ["invalid", "kind", "original", "count", "valuesAll"]; // fixture-only, not tool arguments
const EXAMPLES = 5;

type Case = Record<string, unknown> & { invalid: boolean; kind?: string };
type Outcome = { error: boolean; flagged: boolean; crash?: string };
// biome-ignore lint/suspicious/noExplicitAny: parsed tool responses have a different shape per tool
type Data = any;

const snapshot =
	process.env.TAGINFO_SNAPSHOT ??
	readdirSync(FIXTURES)
		.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
		.sort()
		.at(-1);
const dir = snapshot ? new URL(`${snapshot}/`, FIXTURES) : undefined;

// A tag result that is anything but a plain "... is valid" counts as flagged
const tagFlagged = (r: Data) =>
	r.valid === false || r.deprecated === true || !/ is valid$/.test(r.message ?? "");

/** Did the tool signal a problem with a success-shaped response? (errors are handled separately) */
function flagged(tool: string, d: Data): boolean {
	switch (tool) {
		case "validate_tag":
			return tagFlagged(d);
		case "validate_tag_collection":
			return (
				d.valid === false ||
				d.errorCount > 0 ||
				d.deprecatedCount > 0 ||
				Object.values(d.tagResults ?? {}).some(tagFlagged)
			);
		case "suggest_improvements":
			return d.suggestions?.length === 0;
		case "get_tag_values":
			return d.values?.length === 0;
		case "search_tags":
			return d.keyMatches?.length === 0 && d.valueMatches?.length === 0;
		case "search_presets":
			return Array.isArray(d) && d.length === 0;
		default:
			return false; // flat_to_json, json_to_flat, compare_tags, get_preset_details: only isError counts
	}
}

async function run(client: Client, tool: string, c: Case): Promise<Outcome> {
	const args = Object.fromEntries(Object.entries(c).filter(([k]) => !META_FIELDS.includes(k)));
	try {
		// biome-ignore lint/suspicious/noExplicitAny: SDK result is a loose union
		const r: any = await client.callTool({ name: tool, arguments: args });
		let data: Data;
		try {
			data = JSON.parse(r.content?.[0]?.text);
		} catch {
			data = undefined;
		}
		return {
			error: r.isError === true,
			flagged: r.isError ? false : data !== undefined && flagged(tool, data),
		};
	} catch (e) {
		return { error: false, flagged: false, crash: e instanceof Error ? e.message : String(e) };
	}
}

describe(`taginfo snapshot ${snapshot ?? "(none)"}`, {
	skip: dir && existsSync(dir) ? false : "no fixtures - run scripts/generate-taginfo-cases.ts",
}, () => {
	let client: Client;
	let server: TestServer;
	const report: Record<string, unknown> = {};

	before(async () => {
		({ client, server } = await setupClientServer());
	});
	after(async () => {
		await teardownClientServer(client, server);
		if (dir) {
			writeFileSync(
				new URL("report.json", dir),
				`${JSON.stringify({ snapshot, generatedAt: new Date().toISOString(), commit: execFileSync("git", ["rev-parse", "HEAD"]).toString().trim(), tools: report }, null, 2)}\n`,
			);
			console.log(`report: ${new URL("report.json", dir).pathname}`);
		}
	});

	for (const file of dir && existsSync(dir)
		? readdirSync(dir)
				.filter((f) => f.endsWith(".json") && f !== "report.json")
				.sort()
		: []) {
		const tool = file.replace(/\.json$/, "");
		it(tool, async () => {
			const { cases } = JSON.parse(readFileSync(new URL(file, dir), "utf8")) as { cases: Case[] };
			const byKind: Record<string, { total: number; detected: number; undetected: unknown[] }> = {};
			const valid = { total: 0, errors: 0, flagged: 0, errorExamples: [] as unknown[] };
			const crashes: { input: Case; crash: string }[] = [];
			let invalid = 0;
			let detected = 0;

			for (const c of cases) {
				const o = await run(client, tool, c);
				if (o.crash !== undefined) {
					crashes.push({ input: c, crash: o.crash });
				} else if (c.invalid) {
					const kind = c.kind ?? "unknown";
					byKind[kind] ??= { total: 0, detected: 0, undetected: [] };
					const k = byKind[kind];
					const hit = o.error || o.flagged;
					invalid++;
					k.total++;
					if (hit) {
						k.detected++;
						detected++;
					} else if (k.undetected.length < EXAMPLES) {
						k.undetected.push(
							Object.fromEntries(Object.entries(c).filter(([key]) => !META_FIELDS.includes(key))),
						);
					}
				} else {
					valid.total++;
					valid.flagged += o.flagged ? 1 : 0;
					if (o.error) {
						valid.errors++;
						if (valid.errorExamples.length < EXAMPLES) valid.errorExamples.push(c);
					}
				}
			}

			report[tool] = {
				total: cases.length,
				invalid: {
					total: invalid,
					detected,
					rate: invalid ? +(detected / invalid).toFixed(3) : null,
					byKind,
				},
				valid,
				crashes,
			};
			console.log(
				`${tool.padEnd(24)} invalid detected ${detected}/${invalid} | valid: ${valid.errors} errors, ${valid.flagged} flagged | crashes ${crashes.length}`,
			);
			assert.equal(crashes.length, 0, `${crashes.length} crash(es), first: ${crashes[0]?.crash}`);
		});
	}
});
