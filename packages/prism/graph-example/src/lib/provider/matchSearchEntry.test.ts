import { describe, expect, it } from "vitest";
import { SEARCH_ENTRIES } from "../../testing/fixtures.js";
import { METRO_NAMESPACE } from "./constants.js";
import { matchSearchEntry } from "./matchSearchEntry.js";
import type { SearchEntry } from "./types.js";

const M = METRO_NAMESPACE;

/** The fixture entry whose IRI ends in `name`. */
const entryNamed = (name: string): SearchEntry => {
  const entry = SEARCH_ENTRIES.find((candidate) => candidate.uri === M + name);
  if (entry === undefined) throw new Error(`no fixture entry ${name}`);
  return entry;
};

describe("matchSearchEntry", () => {
  it("matches the title as tier 0", () => {
    expect(matchSearchEntry(entryNamed("depot"), "depot")).toEqual({
      uri: `${M}depot`,
      tier: 0,
      position: 0,
      title: "Depot",
    });
  });

  it("matches the CURIE as tier 1", () => {
    expect(matchSearchEntry(entryNamed("bay"), "platform")).toEqual({
      uri: `${M}bay`,
      tier: 1,
      position: 6,
      title: "Bay",
    });
  });

  it("matches the definition as tier 2", () => {
    expect(matchSearchEntry(entryNamed("canopy"), "rain")).toEqual({
      uri: `${M}canopy`,
      tier: 2,
      position: 27,
      title: "Canopy",
    });
  });

  it("takes an earlier field over an earlier position in a later one", () => {
    expect(matchSearchEntry(entryNamed("depot-sidings"), "si")).toMatchObject({
      tier: 0,
      position: 6,
    });
  });

  it("reads a missing definition as matching nothing", () => {
    expect(matchSearchEntry(entryNamed("sidings"), "rain")).toBeUndefined();
  });

  it("is undefined when no field holds the text", () => {
    expect(matchSearchEntry(entryNamed("depot"), "zz")).toBeUndefined();
  });

  it("ignores the case of the entry", () => {
    expect(matchSearchEntry(entryNamed("z-exit"), "exit")).toMatchObject({
      tier: 0,
      position: 0,
    });
  });
});
