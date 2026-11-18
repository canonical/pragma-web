import { describe, expect, it } from "vitest";
import { FIELDS, OPERATORS, PARTS } from "./constants.js";

describe("constants", () => {
  it("names the parts in order and the choices", () => {
    expect(PARTS).toEqual(["field", "operator", "value"]);
    expect(Object.keys(FIELDS)).toEqual(["status", "pool", "owner"]);
    expect(OPERATORS.map(({ condition }) => condition)).toEqual([
      "inclusion",
      "exclusion",
      "match",
    ]);
  });
});
