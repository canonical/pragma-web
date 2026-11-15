import { describe, expect, it } from "vitest";
import weighStroke from "./weighStroke.js";

describe("weighStroke", () => {
  it("steps the width up a decade at a time", () => {
    expect(
      [1, 9, 10, 99, 100, 999, 1000, 1010].map(
        (count) => weighStroke(count).width,
      ),
    ).toEqual([1, 1, 2, 2, 4, 4, 8, 8]);
  });

  it("dashes only a relation no statement instantiates, at 1px", () => {
    expect(weighStroke(0)).toEqual({ width: 1, dashed: true });
    expect(
      [1, 9, 10, 99, 100, 999, 1000, 1010].some(
        (count) => weighStroke(count).dashed,
      ),
    ).toBe(false);
  });

  it("refuses a count that is not a non-negative integer", () => {
    expect(() => weighStroke(-1)).toThrow("non-negative integer");
    expect(() => weighStroke(1.5)).toThrow("non-negative integer");
  });
});
