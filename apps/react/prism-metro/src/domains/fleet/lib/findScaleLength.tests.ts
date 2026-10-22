import { describe, expect, it } from "vitest";
import findScaleLength from "./findScaleLength.js";

describe("findScaleLength", () => {
  it("takes the longest of the trains and the marked platforms", () => {
    expect(findScaleLength([60000, 120000, 100000])).toBe(120000);
  });

  it("takes a platform longer than every train", () => {
    expect(findScaleLength([62000, 160000])).toBe(160000);
  });

  it("throws when there is nothing to hold", () => {
    expect(() => findScaleLength([])).toThrow(
      "a scale needs at least one length to hold",
    );
  });
});
