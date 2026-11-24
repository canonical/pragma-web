import { describe, expect, it } from "vitest";
import readTypedOperator from "./readTypedOperator.js";

describe("readTypedOperator", () => {
  it("reads the longest symbol typed, and what follows it", () => {
    expect(readTypedOperator(">=64 GiB", ["gte", "lte"])).toEqual({
      operator: "gte",
      widened: false,
      rest: "64 GiB",
    });
    expect(readTypedOperator("> 6", ["gte", "lte"])).toEqual({
      operator: "gte",
      widened: true,
      rest: "6",
    });
    expect(readTypedOperator("<", ["isAny", "lte"])).toBeNull();
    expect(readTypedOperator(":", ["isAny", "isNone"])).toEqual({
      operator: "isAny",
      widened: false,
      rest: "",
    });
  });

  it("waits while another symbol may continue it, and reads none untyped", () => {
    expect(readTypedOperator(">", ["gte"])).toBeNull();
    expect(readTypedOperator("is", ["isAny"])).toBeNull();
    expect(readTypedOperator("<", ["lte"])).toBeNull();
    expect(readTypedOperator("<4", ["lte"])).toMatchObject({
      operator: "lte",
      widened: true,
    });
  });

  it("reads the symbols a chip shows as they are", () => {
    expect(readTypedOperator("≥64", ["gte", "lte"])).toEqual({
      operator: "gte",
      widened: false,
      rest: "64",
    });
    expect(readTypedOperator("≠", ["isAny", "isNone"])).toMatchObject({
      operator: "isNone",
    });
  });
});
