import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import {
  cacheRefRoots,
  collectProseSidecars,
  collectTtlSources,
  harvestPrefixes,
} from "../sources/index.js";
import { bindProseSidecars } from "./bindProseSidecars.js";

const DS = "https://design.example.org/ontology#";

/** A corpus sidecar's Markdown, read from disk. */
const readCorpusFile = (path: string): string =>
  readFileSync(join(CORPUS_REFS_ROOT, "design-system/main", path), "utf-8");

describe("bindProseSidecars", () => {
  const refRoots = cacheRefRoots(CORPUS_REFS_ROOT);
  const sources = collectTtlSources({ refRoots, semRoot: null });
  const binding = bootCorpusQuery().then((query) =>
    bindProseSidecars({
      sidecars: collectProseSidecars(refRoots),
      sources,
      prefixes: harvestPrefixes(sources),
      query,
    }),
  );

  it("binds both of the button's sidecars to ds:button", async () => {
    const { index } = await binding;
    expect([...index.keys()]).toEqual([`${DS}button`]);
    expect(index.get(`${DS}button`)?.texts).toEqual({
      en: readCorpusFile("data/button.md"),
      fr: readCorpusFile("data/button.fr.md"),
    });
  });

  it("lists the button's references in order of first mention", async () => {
    const { index } = await binding;
    expect(index.get(`${DS}button`)?.references).toEqual([
      `${DS}button`,
      `${DS}Component`,
      "https://example.com/spec",
    ]);
  });

  it("reports the note that names no entity", async () => {
    const { unbound } = await binding;
    expect(unbound).toEqual(["design-system/definitions/NOTES.md"]);
  });
});
