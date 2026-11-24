import { describe, expect, it } from "vitest";
import { OPERATOR_SYMBOLS } from "./constants.js";

describe("OPERATOR_SYMBOLS", () => {
  it("gives each operator its typed symbols, widening the strict bounds", () => {
    expect(OPERATOR_SYMBOLS).toEqual({
      isAny: [{ symbol: ":", widened: false }],
      is: [{ symbol: ":", widened: false }],
      isNone: [{ symbol: "!=", widened: false }],
      isNot: [{ symbol: "!=", widened: false }],
      gte: [
        { symbol: ">=", widened: false },
        { symbol: ">", widened: true },
      ],
      lte: [
        { symbol: "<=", widened: false },
        { symbol: "<", widened: true },
      ],
      isSet: [],
      contains: [],
      notContains: [],
      startsWith: [],
      endsWith: [],
    });
    expect(Object.isFrozen(OPERATOR_SYMBOLS)).toBe(true);
  });
});
