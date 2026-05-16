import { jsonl } from 'js-jsonl';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..');
const assetsDir = path.join(rootDir, 'assets');
const strokesDir = path.join(rootDir, 'strokes');

const sourceArg = process.argv[2];
const sourceFile = sourceArg
	? path.resolve(sourceArg)
	: path.join(
			assetsDir,
			fs
				.readdirSync(assetsDir)
				.filter((name) => name.endsWith('.jsonl'))
				.sort()
				.at(-1) ?? ''
		);

if (!sourceFile || !fs.existsSync(sourceFile)) {
	throw new Error(
		`No JSONL source file found. Pass a path explicitly or place a .jsonl file in ${assetsDir}.`
	);
}

console.log(`Parsing ${path.relative(rootDir, sourceFile)} -> ${path.relative(rootDir, strokesDir)}/`);

const data = fs.readFileSync(sourceFile, 'utf8');
const entries = jsonl.parse(data) as Array<Record<string, unknown>>;

fs.mkdirSync(strokesDir, { recursive: true });

const IGNORED_ID_PREFIXES = ['AwEHQD', 'Xu5z76', 'wMjRhN', 'zXhHr8'];
const IGNORED_IDS = new Set([
	'5f523affde54193ed8735326', // 龰 U+9FB0 — duplicate with bad codepoint
]);

const seen = new Map<string, Record<string, unknown>>();
// Map from stroke count to list of entries
const strokeGroups = new Map<number, Record<string, unknown>[]>();

for (const entry of entries) {
	const id = entry['_id'] as string;
	if (IGNORED_ID_PREFIXES.some((prefix) => id?.startsWith(prefix)) || IGNORED_IDS.has(id)) {
		continue;
	}

	const char = (entry['char'] ?? entry['simp']) as string;
	if (!char) {
		console.warn(`Warning: entry missing "char" and "simp" keys, skipping:`, JSON.stringify(entry));
		continue;
	}

	if (seen.has(char)) {
		console.warn(`Warning: duplicate char "${char}"\n  existing: ${JSON.stringify(seen.get(char))}\n  new:      ${JSON.stringify(entry)}`);
	} else {
		seen.set(char, entry);
		const strokeCount = typeof entry['strokeCount'] === 'number' ? entry['strokeCount'] : 0;
		const group = strokeGroups.get(strokeCount) ?? [];
		group.push(entry);
		strokeGroups.set(strokeCount, group);
	}
}

for (const [strokeCount, groupEntries] of strokeGroups) {
	fs.writeFileSync(
		path.join(strokesDir, `${strokeCount}.json`),
		JSON.stringify(groupEntries)
	);
}

const chars = [...seen.keys()];
const indexLines = chars.map((c) => {
	const strokeCount = typeof seen.get(c)!['strokeCount'] === 'number' ? seen.get(c)!['strokeCount'] : 0;
	return `\t${JSON.stringify(c)}: async () => (await import('./strokes/${strokeCount}.json', { with: { type: 'json' } })).default.find(e => (e.char ?? e.simp) === ${JSON.stringify(c)})`;
});
const indexJs = `const characters = {\n${indexLines.join(',\n')}\n};\n\nexport default characters;\n`;
fs.writeFileSync(path.join(rootDir, 'index.js'), indexJs);

console.log(`Wrote ${chars.length} entries across ${strokeGroups.size} stroke-count files to ${path.relative(rootDir, strokesDir)}/ and index.js`);
