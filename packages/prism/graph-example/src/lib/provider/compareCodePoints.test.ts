import { describe, expect, it } from "vitest";
import compareCodePoints from "./compareCodePoints.js";

describe("compareCodePoints", () => {
  it("orders by code point, not by locale", () => {
    expect(["b", "a", "B", "é"].toSorted(compareCodePoints)).toEqual([
      "B",
      "a",
      "b",
      "é",
    ]);
  });

  it("finds two equal strings equal", () => {
    expect(compareCodePoints("a", "a")).toBe(0);
  });
});
