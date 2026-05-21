import { jsonl } from "js-jsonl";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(import.meta.url), "../..");
const assetsDir = path.join(rootDir, "assets");
const unicodeDir = path.join(rootDir, "unicode");

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

console.log(
  `Parsing ${path.relative(rootDir, sourceFile)} -> ${path.relative(rootDir, unicodeDir)}/`,
);

const data = fs.readFileSync(sourceFile, "utf8");
const entries = jsonl.parse(data) as Array<Record<string, unknown>>;

fs.rmSync(unicodeDir, { recursive: true, force: true });
fs.mkdirSync(unicodeDir, { recursive: true });

const IGNORED_ID_PREFIXES = ["AwEHQD", "Xu5z76", "wMjRhN", "zXhHr8"];
const IGNORED_IDS = new Set([
  "5f523affde54193ed8735326", // 龰 U+9FB0 — duplicate with bad codepoint
]);

function bucketKey(char: string): string {
  const cp = char.codePointAt(0);
  if (cp === undefined) throw new Error(`Empty char has no code point`);
  return `${(cp >>> 8).toString(16)}xx`;
}

const seen = new Map<string, Record<string, unknown>>();
const buckets = new Map<string, Record<string, Record<string, unknown>>>();
const charToBucket = new Map<string, string>();

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
    console.warn(
      `Warning: duplicate char "${char}"\n  existing: ${JSON.stringify(seen.get(char))}\n  new:      ${JSON.stringify(entry)}`,
    );
    continue;
  }

  seen.set(char, entry);
  const key = bucketKey(char);
  const bucket = buckets.get(key) ?? {};
  bucket[char] = entry;
  buckets.set(key, bucket);
  charToBucket.set(char, key);
}

for (const [key, bucketEntries] of buckets) {
  fs.writeFileSync(path.join(unicodeDir, `${key}.json`), JSON.stringify(bucketEntries));
}

const chars = [...seen.keys()];
const indexLines = chars.map((c) => {
  const key = charToBucket.get(c)!;
  return `\t${JSON.stringify(c)}: async () => (await import('./unicode/${key}.json', { with: { type: 'json' } })).default[${JSON.stringify(c)}]`;
});
const indexJs = `const characters = {\n${indexLines.join(",\n")}\n};\n\nexport default characters;\n`;
fs.writeFileSync(path.join(rootDir, "index.js"), indexJs);

console.log(
  `Wrote ${chars.length} entries across ${buckets.size} unicode buckets to ${path.relative(rootDir, unicodeDir)}/ and index.js`,
);
