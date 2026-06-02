import { describe, expect, test } from "vite-plus/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { jsonl } from "js-jsonl";
import characters from "../index.gen.js";

describe("characters", () => {
  test("is an object with entries", () => {
    expect(typeof characters).toBe("object");
    expect(Object.keys(characters).length).toBeGreaterThan(0);
  });

  test("each value is a function", () => {
    for (const loader of Object.values(characters).slice(0, 5)) {
      expect(typeof loader).toBe("function");
    }
  });

  test("loader returns character data", async () => {
    const data = await characters["你"]?.();
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
  });

  test("returns undefined for unknown character", async () => {
    const data = await characters["$"]?.();
    expect(data).toBeUndefined();
  });

  test("different characters return different data", async () => {
    const a = await characters["你"]?.();
    const b = await characters["我"]?.();
    expect(a).not.toEqual(b);
  });

  test("returned data has expected fields", async () => {
    const data = await characters["你"]?.();
    expect(data).toHaveProperty("_id");
    expect(data).toHaveProperty("char");
  });

  test("every jsonl entry is referenced in index.gen.js", () => {
    const assetsDir = join(import.meta.dirname, "../assets");
    const sourceFile = readdirSync(assetsDir)
      .filter((f) => f.endsWith(".jsonl"))
      .sort()
      .at(-1);
    if (!sourceFile) throw new Error("No .jsonl file found in assets/");

    const IGNORED_ID_PREFIXES = ["AwEHQD", "Xu5z76", "wMjRhN", "zXhHr8"];
    const IGNORED_IDS = new Set(["5f523affde54193ed8735326"]);

    const data = readFileSync(join(assetsDir, sourceFile), "utf8");
    const entries = jsonl.parse(data) as Array<Record<string, unknown>>;

    const missing: string[] = [];
    const seen = new Set<string>();
    for (const entry of entries) {
      const id = entry["_id"] as string;
      if (IGNORED_ID_PREFIXES.some((p) => id?.startsWith(p)) || IGNORED_IDS.has(id)) continue;
      const char = (entry["char"] ?? entry["simp"]) as string;
      if (!char || seen.has(char)) continue;
      seen.add(char);
      if (!(char in characters)) missing.push(char);
    }

    if (missing.length > 0) {
      throw new Error(
        `${missing.length} character(s) from the JSONL are not referenced in index.gen.js: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}`,
      );
    }
  });

  test("all entries resolve to a defined object", async () => {
    const results = await Promise.all(
      Object.entries(characters).map(async ([char, loader]) => ({
        char,
        data: await loader(),
      })),
    );
    const failed = results.filter(({ data }) => data === undefined || data === null);
    if (failed.length > 0) {
      throw new Error(
        `${failed.length} character(s) resolved to undefined/null: ${failed
          .slice(0, 10)
          .map((f) => f.char)
          .join(", ")}${failed.length > 10 ? "…" : ""}`,
      );
    }
  }, 60_000);
});
