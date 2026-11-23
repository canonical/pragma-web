import { describe, expect, it } from "vitest";
import { EMPTY_SLICE } from "./constants.js";
import listConjuncts from "./listConjuncts.js";

describe("listConjuncts", () => {
  it("lists one address's conjuncts in canonical order, as canonical copies", () => {
    const slice = {
      ...EMPTY_SLICE,
      filter: [
        { field: "tags", operator: "isAny", operands: ["ex-ssd", "ex-gpu"] },
        { field: "tags", operator: "isNone", operands: ["ex-hdd"] },
        { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
      ],
    } as const;
    expect(listConjuncts(slice, "tags", "isAny")).toEqual([
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
      { field: "tags", operator: "isAny", operands: ["ex-gpu", "ex-ssd"] },
    ]);
    expect(listConjuncts(slice, "cpu", "gte")).toEqual([]);
  });
});
