import { DEFAULT_WINDOW, EMPTY_SLICE } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import type { QueryStateStandIn } from "../../../types.js";
import listFieldConjuncts from "./listFieldConjuncts.js";

const state: QueryStateStandIn = {
  slice: {
    ...EMPTY_SLICE,
    filter: [
      { field: "status", operator: "isNone", operands: ["broken"] },
      { field: "pool", operator: "isAny", operands: ["gpu"] },
      { field: "status", operator: "isAny", operands: ["ready"] },
    ],
  },
  window: DEFAULT_WINDOW,
  view: null,
  refused: [],
};

describe("listFieldConjuncts", () => {
  it("reads one field's conjuncts with their places, in canonical order", () => {
    expect(listFieldConjuncts(state, "status")).toEqual([
      {
        predicate: { field: "status", operator: "isAny", operands: ["ready"] },
        ref: { field: "status", operator: "isAny", nth: 0 },
      },
      {
        predicate: {
          field: "status",
          operator: "isNone",
          operands: ["broken"],
        },
        ref: { field: "status", operator: "isNone", nth: 0 },
      },
    ]);
  });

  it("reads nothing for a field the query leaves alone", () => {
    expect(listFieldConjuncts(state, "owner")).toEqual([]);
  });
});
