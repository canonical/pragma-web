import { describe, expect, it } from "vitest";
import { OPERATOR_ARITY } from "./constants.js";
import readCondition from "./readCondition.js";
import type {
  PredicateCondition,
  PredicateOperand,
  PredicateOperator,
} from "./types.js";

const read = (
  operator: PredicateOperator,
  operands: readonly PredicateOperand[] = ["ex"],
): PredicateCondition => readCondition({ field: "f", operator, operands });

describe("readCondition", () => {
  it("reads each operator's condition", () => {
    const conditions = Object.fromEntries(
      (Object.keys(OPERATOR_ARITY) as PredicateOperator[])
        .filter((operator) => operator !== "isSet")
        .map((operator) => [operator, read(operator)]),
    );
    expect(conditions).toEqual({
      isAny: "inclusion",
      is: "inclusion",
      isNone: "exclusion",
      isNot: "exclusion",
      notContains: "exclusion",
      contains: "match",
      startsWith: "match",
      endsWith: "match",
      gte: "range",
      lte: "range",
    });
  });

  it("reads presence from isSet true, and exclusion from isSet false", () => {
    expect(read("isSet", [true])).toBe("presence");
    expect(read("isSet", [false])).toBe("exclusion");
  });

  it("reads isSet with no operand as presence", () => {
    expect(read("isSet", [])).toBe("presence");
  });

  it("throws for an operator outside the grammar", () => {
    expect(() => read("isAll" as PredicateOperator)).toThrow(
      "unknown predicate operator isAll",
    );
  });
});
