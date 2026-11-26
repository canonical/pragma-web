import type { Predicate } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import type { PlacedConjunct } from "../../../types.js";
import readAppliedCount from "./readAppliedCount.js";

const place = (predicate: Predicate): PlacedConjunct => ({
  predicate,
  ref: { field: predicate.field, operator: predicate.operator, nth: 0 },
});

describe("readAppliedCount", () => {
  it("counts nothing where the field holds nothing", () => {
    expect(readAppliedCount([])).toEqual({ count: 0 });
  });

  it("counts every operand, with the condition they share", () => {
    expect(
      readAppliedCount([
        place({
          field: "status",
          operator: "isNone",
          operands: ["broken", "ready"],
        }),
      ]),
    ).toEqual({ count: 2, condition: "exclusion" });
    expect(
      readAppliedCount([
        place({ field: "memory", operator: "gte", operands: [8] }),
        place({ field: "memory", operator: "lte", operands: [64] }),
      ]),
    ).toEqual({ count: 2, condition: "range" });
  });

  it("counts a conjunct without operands once", () => {
    expect(
      readAppliedCount([
        place({ field: "owner", operator: "isSet", operands: [] }),
      ]),
    ).toEqual({ count: 1, condition: "presence" });
  });

  it("names no condition where the conjuncts assert different ones", () => {
    expect(
      readAppliedCount([
        place({ field: "status", operator: "isAny", operands: ["ready"] }),
        place({ field: "status", operator: "isNone", operands: ["broken"] }),
      ]),
    ).toEqual({ count: 2 });
  });
});
