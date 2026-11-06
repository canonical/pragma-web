import type { SortTerm } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import areSortListsEqual from "./areSortListsEqual.js";

const BY_NAME: SortTerm = { field: "name", direction: "asc" };
const BY_CORES: SortTerm = { field: "cores", direction: "desc" };

describe("areSortListsEqual", () => {
  it("says two lists of the same terms in the same order are equal", () => {
    expect(
      areSortListsEqual(
        [BY_NAME, BY_CORES],
        [
          { field: "name", direction: "asc" },
          { field: "cores", direction: "desc" },
        ],
      ),
    ).toBe(true);
  });

  it("says lists that differ in length, order, field or direction are not", () => {
    expect(areSortListsEqual([BY_NAME], [BY_NAME, BY_CORES])).toBe(false);
    expect(areSortListsEqual([BY_NAME, BY_CORES], [BY_CORES, BY_NAME])).toBe(
      false,
    );
    expect(
      areSortListsEqual([BY_NAME], [{ field: "status", direction: "asc" }]),
    ).toBe(false);
    expect(
      areSortListsEqual([BY_NAME], [{ field: "name", direction: "desc" }]),
    ).toBe(false);
  });

  it("says two empty lists are equal", () => {
    expect(areSortListsEqual([], [])).toBe(true);
  });
});
