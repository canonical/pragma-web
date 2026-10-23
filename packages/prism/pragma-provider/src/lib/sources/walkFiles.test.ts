import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT, MISSING_ROOT } from "../../testing/corpus.js";
import { walkFiles } from "./walkFiles.js";

/** The corpus's design-system package, in the refs-cache layout. */
const DESIGN_SYSTEM = join(CORPUS_REFS_ROOT, "design-system/main");

/** The walk's result relative to the package, sorted, for stable assertions. */
const walkRelative = (dir: string, extension: string): string[] =>
  walkFiles(dir, extension)
    .map((path) => relative(DESIGN_SYSTEM, path))
    .sort();

describe("walkFiles", () => {
  it("collects the files with the extension, descending into directories", () => {
    expect(walkRelative(DESIGN_SYSTEM, ".ttl")).toEqual([
      "data/instances.ttl",
      "data/search.ttl",
      "data/tokens/colors.ttl",
      "definitions/ontology.ttl",
    ]);
  });

  it("skips dot-prefixed entries", () => {
    expect(
      walkRelative(DESIGN_SYSTEM, ".ttl").some((path) =>
        path.includes(".channel"),
      ),
    ).toBe(false);
  });

  it("keeps only the extension it is asked for", () => {
    expect(walkRelative(join(DESIGN_SYSTEM, "definitions"), ".md")).toEqual([
      "definitions/NOTES.md",
    ]);
  });

  it("returns absolute paths", () => {
    for (const path of walkFiles(DESIGN_SYSTEM, ".ttl")) {
      expect(path.startsWith(DESIGN_SYSTEM)).toBe(true);
    }
  });

  it("yields nothing for a directory that does not exist", () => {
    expect(walkFiles(MISSING_ROOT, ".ttl")).toEqual([]);
  });
});
