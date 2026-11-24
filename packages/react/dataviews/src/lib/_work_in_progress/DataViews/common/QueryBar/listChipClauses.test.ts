import { DEFAULT_WINDOW } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import listChipClauses from "./listChipClauses.js";
import type { QueryStateStandIn } from "./types.js";

/** A query state over a filter and a search, with one refused parameter. */
const state: QueryStateStandIn = {
  slice: {
    filter: [
      { field: "cores", operator: "gte", operands: [2] },
      { field: "cores", operator: "lte", operands: [8] },
      { field: "status", operator: "isAny", operands: ["ready"] },
    ],
    search: "web",
    sort: [],
    group: [],
  },
  window: DEFAULT_WINDOW,
  view: null,
  refused: [
    {
      parameter: "flavour",
      code: "unknown-field",
      reason: "no such field",
    } as never,
  ],
};

describe("listChipClauses", () => {
  it("shows each conjunct, a range's bounds each on its own, then the search", () => {
    expect(listChipClauses(state).map(({ id }) => id)).toEqual([
      "cores__gte__0",
      "cores__lte__0",
      "status__isAny__0",
      "search",
    ]);
    expect(listChipClauses(state).at(1)).toEqual({
      kind: "predicate",
      id: "cores__lte__0",
      refs: [{ field: "cores", operator: "lte", nth: 0 }],
      predicate: { field: "cores", operator: "lte", operands: [8] },
      condition: "range",
    });
  });
});
