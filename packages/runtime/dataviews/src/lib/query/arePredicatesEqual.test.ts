import { describe, expect, it } from "vitest";
import arePredicatesEqual from "./arePredicatesEqual.js";
import type { Predicate } from "./types.js";

const cpu: Predicate = { field: "cpu", operator: "gte", operands: [4] };
const status: Predicate = {
  field: "status",
  operator: "isAny",
  operands: ["failed", "pending"],
};

describe("arePredicatesEqual", () => {
  it("holds predicates at different addresses unequal", () => {
    expect(arePredicatesEqual(cpu, { ...cpu, field: "ram" })).toBe(false);
    expect(arePredicatesEqual(cpu, { ...cpu, operator: "lte" })).toBe(false);
  });

  it("compares a set operator's operands as a set", () => {
    expect(
      arePredicatesEqual(status, {
        ...status,
        operands: ["pending", "failed", "pending"],
      }),
    ).toBe(true);
    expect(
      arePredicatesEqual(status, { ...status, operands: ["failed"] }),
    ).toBe(false);
    expect(
      arePredicatesEqual(status, {
        ...status,
        operands: ["failed", "running"],
      }),
    ).toBe(false);
  });

  it("compares any other operator's operands by rank, in order", () => {
    expect(arePredicatesEqual(cpu, { ...cpu, operands: [4] })).toBe(true);
    expect(arePredicatesEqual(cpu, { ...cpu, operands: ["4"] })).toBe(false);
    expect(
      arePredicatesEqual(
        { ...cpu, operands: [Number.NaN] },
        { ...cpu, operands: [Number.NaN] },
      ),
    ).toBe(true);
  });
});
