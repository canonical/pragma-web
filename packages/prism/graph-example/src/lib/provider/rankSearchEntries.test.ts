import { describe, expect, it } from "vitest";
import { RANKING_CASES, SEARCH_ENTRIES } from "../../testing/fixtures.js";
import { rankSearchEntries } from "./rankSearchEntries.js";

describe("rankSearchEntries", () => {
  it.each(RANKING_CASES)("$name", ({ text, expected }) => {
    expect(rankSearchEntries(SEARCH_ENTRIES, text)).toEqual(expected);
  });

  it.each(RANKING_CASES)(
    "$name, whatever the index's order",
    ({ text, expected }) => {
      expect(rankSearchEntries(SEARCH_ENTRIES.toReversed(), text)).toEqual(
        expected,
      );
    },
  );

  it("finds nothing in an empty index", () => {
    expect(rankSearchEntries([], "alert")).toEqual([]);
  });
});
