import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPUS_EMPTY_REFS_ROOT,
  CORPUS_REFS_ROOT,
} from "../../testing/corpus.js";
import { collectProseSidecars } from "./collectProseSidecars.js";
import { cacheRefRoots } from "./resolveRefRoots.js";

describe("collectProseSidecars", () => {
  const sidecars = collectProseSidecars(cacheRefRoots(CORPUS_REFS_ROOT));

  it("collects every Markdown file under the ref packages, sorted by path", () => {
    expect(sidecars.map((sidecar) => sidecar.path)).toStrictEqual([
      "design-system/data/button.fr.md",
      "design-system/data/button.md",
      "design-system/definitions/NOTES.md",
    ]);
  });

  it("carries each file's Markdown as written", () => {
    const button = sidecars.find(
      (sidecar) => sidecar.path === "design-system/data/button.md",
    );
    expect(button?.content).toBe(
      readFileSync(
        join(CORPUS_REFS_ROOT, "design-system/main/data/button.md"),
        "utf-8",
      ),
    );
  });

  it("collects nothing from roots that hold no Markdown", () => {
    expect(collectProseSidecars(cacheRefRoots(CORPUS_EMPTY_REFS_ROOT))).toEqual(
      [],
    );
  });
});
