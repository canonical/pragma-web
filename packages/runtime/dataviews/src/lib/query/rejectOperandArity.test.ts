import { describe, expect, it } from "vitest";
import rejectOperandArity from "./rejectOperandArity.js";

describe("rejectOperandArity", () => {
  it("asks a set operator for at least one operand", () => {
    expect(rejectOperandArity("isAny", 2)).toBeNull();
    expect(rejectOperandArity("isNone", 0)).toBe(
      "isNone predicate needs at least one operand",
    );
  });

  it("asks every other operator for exactly one", () => {
    expect(rejectOperandArity("gte", 1)).toBeNull();
    expect(rejectOperandArity("isSet", 1)).toBeNull();
    expect(rejectOperandArity("isSet", 0)).toBe(
      "isSet predicate needs exactly one operand",
    );
    expect(rejectOperandArity("contains", 2)).toBe(
      "contains predicate needs exactly one operand",
    );
  });
});
