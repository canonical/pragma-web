import { describe, expect, it } from "vitest";
import rejectOperandArity from "./rejectOperandArity.js";

describe("rejectOperandArity", () => {
  it("needs at least one operand for a set operator", () => {
    expect(rejectOperandArity("isAny", 2)).toBeNull();
    expect(rejectOperandArity("isNone", 0)).toBe(
      "isNone predicate needs at least one operand",
    );
  });

  it("needs exactly one operand for a single-operand operator", () => {
    expect(rejectOperandArity("gte", 1)).toBeNull();
    expect(rejectOperandArity("contains", 2)).toBe(
      "contains predicate needs exactly one operand",
    );
  });

  it("takes no operands for isSet", () => {
    expect(rejectOperandArity("isSet", 0)).toBeNull();
    expect(rejectOperandArity("isSet", 1)).toBe(
      "isSet predicate takes no operands",
    );
  });
});
