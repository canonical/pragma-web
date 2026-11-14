import { describe, expect, it } from "vitest";
import stringifyStable from "./stringifyStable.js";

describe("stringifyStable", () => {
  it("writes a value as JSON", () => {
    expect(stringifyStable({ a: [1, "b", null] })).toBe('{"a":[1,"b",null]}');
  });

  it("marks a non-finite number, so it never reads as null", () => {
    expect(stringifyStable([Number.NaN, null])).toBe(
      '[{"nonfinite":"NaN"},null]',
    );
    expect(stringifyStable(Number.NEGATIVE_INFINITY)).toBe(
      '{"nonfinite":"-Infinity"}',
    );
  });
});
