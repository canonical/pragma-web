import { describe, expect, it } from "vitest";
import clampToSlider from "./clampToSlider.js";

describe("clampToSlider", () => {
  it("falls back to the minimum for an empty or invalid value", () => {
    expect(clampToSlider(null, 2, 8)).toBe(2);
    expect(clampToSlider(undefined, 2, 8)).toBe(2);
    expect(clampToSlider(Number.NaN, 2, 8)).toBe(2);
  });

  it("bounds the value", () => {
    expect(clampToSlider(1, 2, 8)).toBe(2);
    expect(clampToSlider(5, 2, 8)).toBe(5);
    expect(clampToSlider(9, 2, 8)).toBe(8);
  });
});
