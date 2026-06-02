import { jsonl } from "js-jsonl";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(rootDir, "assets");
const uDir = path.join(rootDir, "u");

const sourceArg = process.argv[2];
const sourceFile = sourceArg
  ? path.resolve(sourceArg)
  : path.join(
      assetsDir,
      fs
        .readdirSync(assetsDir)
        .filter((name) => name.endsWith(".jsonl"))
        .sort()
        .at(-1) ?? "",
    );

if (!sourceFile || !fs.existsSync(sourceFile)) {
  throw new Error(
    `No JSONL source file found. Pass a path explicitly or place a .jsonl file in ${assetsDir}.`,
  );
}

console.log(`Parsing ${path.relative(rootDir, sourceFile)} -> ${path.relative(rootDir, uDir)}/`);

const data = fs.readFileSync(sourceFile, "utf8");
const entries = jsonl.parse(data) as Array<Record<string, unknown>>;

fs.rmSync(uDir, { recursive: true, force: true });
fs.mkdirSync(uDir, { recursive: true });

const IGNORED_ID_PREFIXES = ["AwEHQD", "Xu5z76", "wMjRhN", "zXhHr8"];
const IGNORED_IDS = new Set([
  "5f523affde54193ed8735326", // 龰 U+9FB0 — duplicate with bad codepoint
]);

function bucketKey(char: string): string {
  const cp = char.codePointAt(0);
  if (cp === undefined) throw new Error(`Empty char has no code point`);
  return (cp >>> 8).toString(16);
}

const seen = new Set<string>();
// Each bucket is a top-level array; charLocation maps a char to its [bucket, index].
const buckets = new Map<string, Array<Record<string, unknown>>>();
const charLocation = new Map<string, [string, number]>();

for (const entry of entries) {
  const id = entry["_id"] as string;
  if (IGNORED_ID_PREFIXES.some((prefix) => id?.startsWith(prefix)) || IGNORED_IDS.has(id)) {
    continue;
  }

  const char = (entry["char"] ?? entry["simp"]) as string;
  if (!char) {
    console.warn(`Warning: entry missing "char" and "simp" keys, skipping:`, JSON.stringify(entry));
    continue;
  }

  if (seen.has(char)) {
    console.warn(`Warning: duplicate char "${char}", skipping:`, JSON.stringify(entry));
    continue;
  }

  seen.add(char);
  const key = bucketKey(char);
  const bucket = buckets.get(key) ?? [];
  const index = bucket.length;
  bucket.push(entry);
  buckets.set(key, bucket);
  charLocation.set(char, [key, index]);
}

for (const [key, bucketEntries] of buckets) {
  fs.writeFileSync(path.join(uDir, `${key}.json`), JSON.stringify(bucketEntries));
}

// index.gen.js: a char -> loader map. `D` curries the array index so each entry
// only carries its bucket file (a static import specifier, kept literal so bundlers
// can statically trace the chunks) and its index within that bucket array.
const chars = [...seen];
const indexLines = chars.map((c) => {
  const [key, index] = charLocation.get(c)!;
  return `${JSON.stringify(c)}:_=>import('./u/${key}.json',{with:{type:'json'}}).then(D(${index}))`;
});
const indexJs = `var D=i=>m=>m.default[i];\nvar characters={\n${indexLines.join(",\n")}\n};\nexport default characters;\n`;
fs.writeFileSync(path.join(rootDir, "index.gen.js"), indexJs);

console.log(
  `Wrote ${chars.length} entries across ${buckets.size} buckets to ${path.relative(rootDir, uDir)}/ and index.gen.js`,
);
