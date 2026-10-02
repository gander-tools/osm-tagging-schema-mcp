// Generates test inputs per tool from a local taginfo-db sqlite file (read-only).
// A run is a point-in-time snapshot: output goes to tests/fixtures/taginfo/<data_until date>/ and the
// PRNG seed derives from that date, so the same DB gives identical files and a newer DB gives a new set.
// Usage: TAGINFO_DB=/path/taginfo-db.db node scripts/generate-taginfo-cases.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const DB = process.env.TAGINFO_DB ?? process.argv[2];
if (!DB) {
	console.error(
		"Usage: TAGINFO_DB=/path/taginfo-db.db node scripts/generate-taginfo-cases.ts  (or pass the path as argument)",
	);
	process.exit(1);
}
const db = new DatabaseSync(DB, { readOnly: true });
const meta = db.prepare("select data_until from source").get() as { data_until: string };
const SNAPSHOT = meta.data_until.slice(0, 10); // e.g. 2026-10-01
const OUT = new URL(`../tests/fixtures/taginfo/${SNAPSHOT}/`, import.meta.url);

// mulberry32 - seeded per snapshot, so a given DB always yields the same fixtures
let seed = Number(SNAPSHOT.replaceAll("-", ""));
const rnd = () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)] as T;
const sample = <T>(a: T[], n: number): T[] => {
	const c = [...a];
	for (let i = c.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[c[i], c[j]] = [c[j] as T, c[i] as T];
	}
	return c.slice(0, n);
};
const q = <T>(sql: string, ...p: (string | number)[]) => db.prepare(sql).all(...p) as T[];

// Tag values that are plain and safe for key=value text format
const clean = (s: string) =>
	s.length > 0 && s.length <= 100 && !/[=\n\r]/.test(s) && s === s.trim();

const FEATURE_KEYS = [
	"amenity",
	"shop",
	"highway",
	"building",
	"tourism",
	"leisure",
	"natural",
	"landuse",
	"waterway",
	"railway",
	"man_made",
	"barrier",
	"power",
	"office",
	"craft",
	"emergency",
	"historic",
	"healthcare",
	"public_transport",
	"aeroway",
	"place",
	"boundary",
	"route",
	"military",
	"sport",
	"natural",
	"club",
	"cuisine",
	"service",
];

type Tag = { key: string; value: string; count: number };

// Popular, mid-range and rare values for every feature key -> stratified pool (rare ones are likely off-schema)
const pool: Tag[] = [];
const seen = new Set<string>();
for (const key of [...new Set(FEATURE_KEYS)]) {
	const rows = q<{ value: string; count_all: number }>(
		"select value, count_all from tags where key = ? order by count_all desc limit 4000",
		key,
	).filter((r) => clean(r.value));
	const n = rows.length;
	const strata = [rows.slice(0, 25), rows.slice(25, Math.max(25, n >> 2)), rows.slice(n >> 2)];
	for (const [i, s] of strata.entries()) {
		for (const r of sample(s, [150, 150, 150][i] as number)) {
			if (!seen.has(`${key}=${r.value}`)) {
				seen.add(`${key}=${r.value}`);
				pool.push({ key, value: r.value, count: r.count_all });
			}
		}
	}
}
// Non-feature keys too (name, surface, opening_hours, ...) for validate_tag
const otherKeys = q<{ key: string; count_all: number }>(
	"select key, count_all from keys where count_all >= 5000 and values_all <= 50000 and key not like '%:%' order by count_all desc limit 3000",
).filter((r) => clean(r.key));
const otherTags: Tag[] = [];
for (const k of sample(otherKeys, 400)) {
	const v = q<{ value: string; count_all: number }>(
		"select value, count_all from tags where key = ? order by count_all desc limit 30",
		k.key,
	).filter((r) => clean(r.value));
	if (v.length) {
		const r = pick(v);
		otherTags.push({ key: k.key, value: r.value, count: r.count_all });
	}
}

const N = 1000;
const toRec = (...t: { key: string; value: string }[]) =>
	Object.fromEntries(t.map((x) => [x.key, x.value]));
const toFlat = (r: Record<string, string>) =>
	Object.entries(r)
		.map(([k, v]) => `${k}=${v}`)
		.join("\n");

// Tag sets from real co-occurrence (tag_combinations): main tag + 1..3 companions with concrete values
function tagSet(main: Tag, extra: number): Record<string, string> {
	const rows = q<{ key2: string; value2: string }>(
		`select key2, value2 from tag_combinations where key1 = ? and value1 = ? and value2 != ''
		 order by count_all desc limit 40`,
		main.key,
		main.value,
	).filter((r) => clean(r.key2) && clean(r.value2) && r.key2 !== main.key);
	const rec: Record<string, string> = { [main.key]: main.value };
	for (const r of sample(rows, extra)) rec[r.key2] ??= r.value2;
	return rec;
}
// Keep only pool tags that actually have companions in the DB
const withCombos = pool.filter((t) => Object.keys(tagSet(t, 1)).length > 1);

const N_BAD = 250; // invalid inputs per tool (validate_tag_collection: 100% mutated/malformed, see below)

const keyExists = (k: string) => q("select 1 from keys where key = ? limit 1", k).length > 0;
const tagExists = (k: string, v: string) =>
	q("select 1 from tags where key = ? and value = ? limit 1", k, v).length > 0;
const typo = (w: string) => {
	const i = 1 + Math.floor(rnd() * Math.max(1, w.length - 2));
	return w.length > 3 ? `${w.slice(0, i)}${w[i + 1] ?? ""}${w[i]}${w.slice(i + 2)}` : `${w}x`; // transpose
};
const gibberish = () =>
	Array.from({ length: 8 + Math.floor(rnd() * 8) }, () =>
		String.fromCharCode(97 + Math.floor(rnd() * 26)),
	).join("");

// Real set with one tag corrupted; each corrupted key/value is verified absent from taginfo
type Mut = (r: Record<string, string>, k: string) => Record<string, string> | null;
const mutations: Record<string, Mut> = {
	value_typo: (r, k) => {
		const v = typo(r[k] as string);
		return v !== r[k] && !tagExists(k, v) ? { ...r, [k]: v } : null;
	},
	key_typo: (r, k) => {
		const nk = typo(k);
		if (nk === k || keyExists(nk)) return null;
		const { [k]: v, ...rest } = r;
		return { ...rest, [nk]: v as string };
	},
	key_value_swapped: (r, k) => {
		const v = r[k] as string;
		if (!clean(v) || keyExists(v) || tagExists(v, k)) return null;
		const { [k]: _, ...rest } = r;
		return { ...rest, [v]: k };
	},
	foreign_value: (r, k) => {
		const other = pick(pool.filter((t) => t.key !== k));
		return tagExists(k, other.value) ? null : { ...r, [k]: other.value };
	},
	uppercase_key: (r, k) => {
		const nk = k.toUpperCase();
		if (nk === k || keyExists(nk)) return null;
		const { [k]: v, ...rest } = r;
		return { ...rest, [nk]: v as string };
	},
	space_in_key: (r, k) => {
		const { [k]: v, ...rest } = r;
		return { ...rest, [`${k} x`]: v as string };
	},
	empty_value: (r, k) => ({ ...r, [k]: "" }),
};
const mutNames = Object.keys(mutations);
function mutate(i: number, extra = 1 + (i % 3)) {
	const original = tagSet(pick(withCombos), extra);
	for (let m = 0; m < mutNames.length; m++) {
		const kind = mutNames[(i + m) % mutNames.length] as string;
		const bad = (mutations[kind] as Mut)(original, pick(Object.keys(original)));
		if (bad) return { bad, kind, original };
	}
	throw new Error("no applicable mutation");
}
const asTags = (r: Record<string, string>, i: number) => (i % 3 === 0 ? toFlat(r) : r);

// Structurally malformed tag input (flat text / JSON string) for tools taking `tags`
const malformed = (i: number): { tags: string; kind: string } => {
	const t = pick(withCombos);
	const good = toFlat(tagSet(t, 1));
	const kinds: [string, string][] = [
		["empty_string", ""],
		["whitespace_only", " \n\t "],
		["line_without_equals", `${good}\nnot a tag line`],
		["empty_key", `=${t.value}`],
		["empty_value_line", `${t.key}=`],
		["only_equals", "="],
		["duplicate_key", `${t.key}=${t.value}\n${t.key}=${gibberish()}`],
		["broken_json", `{"${t.key}": "${t.value}"`],
		["json_array", JSON.stringify([`${t.key}=${t.value}`])],
		["control_chars", `${t.key}=${t.value}\u0000\u0007`],
	];
	const [kind, tags] = kinds[i % kinds.length] as [string, string];
	return { tags, kind };
};

// Builds exactly N unique cases: N_BAD invalid (invalid:true + kind) and the rest real taginfo data, shuffled
function build(
	name: string,
	valid: (i: number) => object,
	invalid: (i: number) => object & { kind: string },
	nBad = N_BAD,
) {
	const seen = new Set<string>();
	const cases: object[] = [];
	const add = (gen: (i: number) => object, bad: boolean, n: number) => {
		let have = 0;
		for (let i = 0; have < n && i < n * 100; i++) {
			const c = { ...gen(i), invalid: bad };
			const key = JSON.stringify(c);
			if (!seen.has(key)) {
				seen.add(key);
				cases.push(c);
				have++;
			}
		}
		if (have < n) console.warn(`${name}: only ${have}/${n} unique ${bad ? "invalid" : "valid"}`);
	};
	add(invalid, true, nBad);
	add(valid, false, N - nBad);
	mkdirSync(OUT, { recursive: true });
	writeFileSync(
		new URL(`${name}.json`, OUT),
		`${JSON.stringify({ source: "taginfo", dataUntil: meta.data_until, tool: name, count: cases.length, cases: sample(cases, cases.length) })}\n`,
	);
	console.log(name.padEnd(24), cases.length, "invalid:", nBad);
}

// validate_tag
const singles = [...pool, ...otherTags];
build(
	"validate_tag",
	() => {
		const { key, value, count } = pick(singles);
		return { key, value, count };
	},
	(i) => {
		const t = pick(singles);
		const fixed: [string, { key: string; value: string }][] = [
			["empty_key", { key: "", value: t.value }],
			["empty_value", { key: t.key, value: "" }],
			["key_with_equals", { key: `${t.key}=x`, value: t.value }],
			["whitespace_key", { key: "  ", value: t.value }],
			["very_long_key", { key: "k".repeat(300), value: t.value }],
			["very_long_value", { key: t.key, value: "v".repeat(300) }],
		];
		if (i % 3 === 0)
			return {
				...(fixed[(i / 3) % fixed.length] as [string, object])[1],
				kind: (fixed[(i / 3) % fixed.length] as [string, object])[0],
			};
		const { bad, kind } = mutate(i, 0);
		const [key, value] = Object.entries(bad)[0] as [string, string];
		return { key, value, kind };
	},
);

// validate_tag_collection: invalid-only per request (mutated real sets + malformed inputs)
build(
	"validate_tag_collection",
	() => ({}),
	(i) => {
		if (i % 5 === 4) return malformed(i);
		const { bad, kind, original } = mutate(i);
		return { tags: asTags(bad, i), kind, original };
	},
	N,
);

// suggest_improvements: incomplete sets (valid) vs mutated / malformed (invalid)
build(
	"suggest_improvements",
	(i) => {
		const t = pick(withCombos);
		const r = i % 2 ? tagSet(t, 1) : toRec(t);
		return { tags: i % 4 === 0 ? toFlat(r) : r };
	},
	(i) => {
		if (i % 4 === 3) return malformed(i);
		const { bad, kind } = mutate(i);
		return { tags: asTags(bad, i), kind };
	},
);

// get_tag_values
const keys = q<{ key: string; count_all: number; values_all: number }>(
	"select key, count_all, values_all from keys where values_all > 1 and count_all >= 1000 order by count_all desc limit 8000",
).filter((r) => clean(r.key));
build(
	"get_tag_values",
	(i) => {
		const k = i < 300 ? (keys[i] as (typeof keys)[number]) : pick(keys);
		return {
			tagKey: k.key,
			...(i % 5 === 0 ? { options: { limit: 10 } } : {}),
			valuesAll: k.values_all,
		};
	},
	(i) => {
		const k = pick(keys).key;
		const bad: [string, object][] = [
			["key_typo", { tagKey: typo(k) }],
			["unknown_key", { tagKey: gibberish() }],
			["uppercase_key", { tagKey: k.toUpperCase() }],
			["empty_key", { tagKey: "" }],
			["whitespace_key", { tagKey: "   " }],
			["key_with_equals", { tagKey: `${k}=x` }],
			["limit_zero", { tagKey: k, options: { limit: 0 } }],
			["limit_negative", { tagKey: k, options: { limit: -5 } }],
		];
		const [kind, c] = bad[i % bad.length] as [string, object];
		return { ...c, kind };
	},
);

// search_tags: keys, values and prefixes
const words = [...keys.map((k) => k.key), ...pool.map((t) => t.value)];
build(
	"search_tags",
	(i) => {
		const w = pick(words);
		const s = i % 4 === 0 && w.length > 5 ? w.slice(0, Math.max(3, w.length >> 1)) : w;
		return { keyword: s.replace(/_/g, i % 2 ? " " : "_"), ...(i % 5 === 0 ? { limit: 20 } : {}) };
	},
	(i) => {
		const bad: [string, object][] = [
			["gibberish", { keyword: gibberish() }],
			["empty", { keyword: "" }],
			["whitespace", { keyword: "   " }],
			["regex_chars", { keyword: pick(["(.*", "[a-", "%", "\\", "a|b|(", ".*"]) }],
			["very_long", { keyword: gibberish().repeat(40) }],
			["limit_zero", { keyword: pick(words), limit: 0 }],
			["limit_negative", { keyword: pick(words), limit: -1 }],
			["non_latin_noise", { keyword: pick(["żółć", "日本語", "🍺", "ñandú"]) + gibberish() }],
		];
		const [kind, c] = bad[i % bad.length] as [string, object];
		return { ...c, kind };
	},
);

// search_presets
const geoms = [undefined, "point", "line", "area", "vertex", "relation"] as const;
build(
	"search_presets",
	(i) => {
		const geometry = geoms[i % geoms.length];
		return {
			keyword: pick(pool).value.replace(/_/g, " "),
			...(geometry ? { geometry } : {}),
			...(i % 7 === 0 ? { limit: 10 } : {}),
		};
	},
	(i) => {
		const bad: [string, object][] = [
			["gibberish", { keyword: gibberish() }],
			["empty", { keyword: "" }],
			[
				"invalid_geometry",
				{ keyword: pick(pool).value, geometry: pick(["polygon", "building", "POINT", "node"]) },
			],
			["limit_zero", { keyword: pick(pool).value, limit: 0 }],
			["limit_negative", { keyword: pick(pool).value, limit: -3 }],
			["regex_chars", { keyword: pick(["(.*", "[a-", "%"]) }],
		];
		const [kind, c] = bad[i % bad.length] as [string, object];
		return { ...c, kind };
	},
);

// get_preset_details: "key/value" ids (rare ones may be not-found) or tags record
build(
	"get_preset_details",
	(i) => {
		const t = pick(pool);
		return { presetId: i % 3 === 0 ? tagSet(t, 1) : `${t.key}/${t.value}` };
	},
	(i) => {
		const t = pick(pool);
		const bad: [string, object][] = [
			["typo_id", { presetId: `${typo(t.key)}/${typo(t.value)}` }],
			["unknown_id", { presetId: `${gibberish()}/${gibberish()}` }],
			["empty_id", { presetId: "" }],
			["trailing_slash", { presetId: `${t.key}/` }],
			["empty_record", { presetId: {} }],
			["uppercase_id", { presetId: `${t.key}/${t.value}`.toUpperCase() }],
			["mutated_record", { presetId: mutate(i, 1).bad }],
			["id_with_spaces", { presetId: `${t.key} / ${t.value}` }],
		];
		const [kind, c] = bad[i % bad.length] as [string, object];
		return { ...c, kind };
	},
);

// flat_to_json: valid flat text vs malformed lines
build(
	"flat_to_json",
	(i) => {
		const flat = toFlat(tagSet(pick(withCombos), i % 4));
		return { tags: i % 6 === 0 ? `${flat}\n\n` : flat };
	},
	(i) => malformed(i),
);

// json_to_flat: records / JSON strings vs malformed JSON
build(
	"json_to_flat",
	(i) => {
		const r = tagSet(pick(withCombos), i % 4);
		return { tags: i % 5 === 0 ? JSON.stringify(r) : r };
	},
	(i) => {
		const r = tagSet(pick(withCombos), 1);
		const bad: [string, string | object][] = [
			["broken_json", `{"${Object.keys(r)[0]}": "x"`],
			["json_array", JSON.stringify(Object.entries(r))],
			["json_string", JSON.stringify(toFlat(r))],
			["json_null", "null"],
			["nested_object", JSON.stringify({ tags: r })],
			["number_values", JSON.stringify(Object.fromEntries(Object.keys(r).map((k) => [k, 1])))],
			["empty_string", ""],
			["flat_text_not_json", `{${toFlat(r)}}`],
		];
		const [kind, tags] = bad[i % bad.length] as [string, string | object];
		return { tags, kind };
	},
);

// compare_tags: old vs new (same main tag, companions differ) vs malformed side / mutated new set
build(
	"compare_tags",
	(i) => {
		const t = pick(withCombos);
		const oldTags = tagSet(t, 1 + (i % 3));
		const newTags = { ...tagSet(t, 1 + ((i + 1) % 3)) };
		const k = Object.keys(oldTags)[1];
		if (i % 3 === 0 && k) newTags[k] = `${oldTags[k]}_changed`;
		else if (JSON.stringify(oldTags) === JSON.stringify(newTags) && i % 2) newTags.note = "changed"; // keep some unchanged pairs
		return { oldTags, newTags };
	},
	(i) => {
		const good = tagSet(pick(withCombos), 1);
		if (i % 2) {
			const { bad, kind } = mutate(i);
			return { oldTags: good, newTags: bad, kind: `new_${kind}` };
		}
		const m = malformed(i);
		return i % 4 === 0
			? { oldTags: m.tags, newTags: good, kind: `old_${m.kind}` }
			: { oldTags: good, newTags: m.tags, kind: `new_${m.kind}` };
	},
);
