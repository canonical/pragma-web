import { describe, expect, it } from "vitest";
import { settle } from "./settle.js";

describe("settle", () => {
  it("rounds to a tenth of a px", () => {
    expect(settle(12.345)).toBe(12.3);
    expect(settle(12.35)).toBe(12.4);
    expect(settle(-3.04)).toBe(-3);
    expect(settle(7)).toBe(7);
  });
});
