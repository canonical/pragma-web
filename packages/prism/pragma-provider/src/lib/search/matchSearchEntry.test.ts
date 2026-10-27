import { describe, expect, it } from "vitest";
import { SEARCH_ENTRIES } from "../../testing/fixtures.js";
import { matchSearchEntry } from "./matchSearchEntry.js";
import type { SearchEntry } from "./types.js";

const DS = "https://design.example.org/ontology#";

/** The fixture entry whose IRI ends in `name`. */
const entryNamed = (name: string): SearchEntry => {
  const entry = SEARCH_ENTRIES.find((candidate) => candidate.uri === DS + name);
  if (entry === undefined) throw new Error(`no fixture entry ${name}`);
  return entry;
};

describe("matchSearchEntry", () => {
  it("matches the title as tier 0", () => {
    expect(matchSearchEntry(entryNamed("alert"), "alert")).toEqual({
      uri: `${DS}alert`,
      tier: 0,
      position: 0,
      title: "Alert",
    });
  });

  it("matches the CURIE as tier 1", () => {
    expect(matchSearchEntry(entryNamed("callout"), "notice")).toEqual({
      uri: `${DS}callout`,
      tier: 1,
      position: 3,
      title: "Callout",
    });
  });

  it("matches the definition as tier 2", () => {
    expect(matchSearchEntry(entryNamed("toast"), "event")).toEqual({
      uri: `${DS}toast`,
      tier: 2,
      position: 13,
      title: "Toast",
    });
  });

  it("takes an earlier field over an earlier position in a later one", () => {
    expect(matchSearchEntry(entryNamed("alert-banner"), "an")).toMatchObject({
      tier: 0,
      position: 7,
    });
  });

  it("reads a missing definition as matching nothing", () => {
    expect(matchSearchEntry(entryNamed("banner"), "pinned")).toBeUndefined();
  });

  it("is undefined when no field holds the text", () => {
    expect(matchSearchEntry(entryNamed("alert"), "zz")).toBeUndefined();
  });

  it("ignores the case of the entry", () => {
    expect(matchSearchEntry(entryNamed("z-tabs"), "tabs")).toMatchObject({
      tier: 0,
      position: 0,
    });
  });
});
