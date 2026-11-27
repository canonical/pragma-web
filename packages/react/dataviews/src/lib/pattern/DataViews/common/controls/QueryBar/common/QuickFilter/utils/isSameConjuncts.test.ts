import { describe, expect, it } from "vitest";
import type { PlacedConjunct } from "../../../types.js";
import isSameConjuncts from "./isSameConjuncts.js";

const ready: PlacedConjunct = {
  predicate: { field: "status", operator: "isAny", operands: ["ready"] },
  ref: { field: "status", operator: "isAny", nth: 0 },
};

describe("isSameConjuncts", () => {
  it("holds for two readings of the same conjuncts", () => {
    expect(isSameConjuncts([ready], [{ ...ready }])).toBe(true);
  });

  it("fails once an operand or a place moves", () => {
    expect(
      isSameConjuncts(
        [ready],
        [{ ...ready, predicate: { ...ready.predicate, operands: ["broken"] } }],
      ),
    ).toBe(false);
    expect(isSameConjuncts([ready], [])).toBe(false);
  });
});
