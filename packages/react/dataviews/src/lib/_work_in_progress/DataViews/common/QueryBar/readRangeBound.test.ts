import { DEFAULT_WINDOW } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import readClauses from "./readClauses.js";
import readRangeBound from "./readRangeBound.js";
import type { QueryRangeClause } from "./types.js";

const [range] = readClauses({
  slice: {
    filter: [
      { field: "cores", operator: "gte", operands: [2] },
      { field: "cores", operator: "lte", operands: [8] },
    ],
    search: null,
    sort: [],
    group: [],
  },
  window: DEFAULT_WINDOW,
  view: null,
  refused: [],
}) as [QueryRangeClause];

describe("readRangeBound", () => {
  it("reads a bound as an edit standing under the range's id", () => {
    expect(readRangeBound(range, 1, range.upper)).toEqual({
      kind: "predicate",
      origin: {
        id: "cores__range",
        ref: { field: "cores", operator: "lte", nth: 0 },
        held: range.upper,
      },
      field: "cores",
      operator: "lte",
      operands: [8],
    });
  });
});
