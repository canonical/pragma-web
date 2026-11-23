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
  it("shows each conjunct, a field's two bounds as one range, then the search", () => {
    expect(listChipClauses(state).map(({ id }) => id)).toEqual([
      "cores__range",
      "status__isAny__0",
      "search",
    ]);
    expect(listChipClauses(state).at(0)).toMatchObject({
      kind: "range",
      refs: [
        { field: "cores", operator: "gte", nth: 0 },
        { field: "cores", operator: "lte", nth: 0 },
      ],
    });
  });
});
