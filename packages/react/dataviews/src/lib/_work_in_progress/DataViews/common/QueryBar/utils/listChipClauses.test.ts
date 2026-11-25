import { DEFAULT_WINDOW } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import type { QueryStateStandIn } from "../types.js";
import listChipClauses from "./listChipClauses.js";

/** A query state over a filter and a search, with two refused parameters. */
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
    { parameter: "sort", field: null, code: "invalid", reason: "no" },
    {
      parameter: "status",
      field: "status",
      code: "invalid",
      reason: "melted is not an option",
    },
  ],
};

describe("listChipClauses", () => {
  it("shows each conjunct, a field's two bounds as one range, the search, then a refused filter", () => {
    expect(listChipClauses(state).map(({ id }) => id)).toEqual([
      "cores__range",
      "status__isAny__0",
      "search",
      "refused__status",
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
