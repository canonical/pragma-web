import { describe, expect, it } from "vitest";
import compareBounds from "./compareBounds.js";

describe("compareBounds", () => {
  it("orders two numbers as numbers", () => {
    expect(compareBounds(4, 16)).toBe(-1);
    expect(compareBounds(16, 4)).toBe(1);
    expect(compareBounds(8, 8)).toBe(0);
  });

  it("orders two calendar dates as their text", () => {
    expect(compareBounds("2026-01-31", "2026-02-01")).toBe(-1);
    expect(compareBounds("2026-02-01", "2026-01-31")).toBe(1);
    expect(compareBounds("2026-02-01", "2026-02-01")).toBe(0);
  });

  it("orders no other pair", () => {
    expect(compareBounds(8, "8")).toBeNull();
    expect(compareBounds(true, false)).toBeNull();
    expect(compareBounds(null, 1)).toBeNull();
    expect(compareBounds(undefined, 1)).toBeNull();
  });
});
