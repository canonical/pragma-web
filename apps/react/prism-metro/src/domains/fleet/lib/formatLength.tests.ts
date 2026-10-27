import { describe, expect, it } from "vitest";
import formatLength from "./formatLength.js";

describe("formatLength", () => {
  it("reads whole metres without a decimal", () => {
    expect(formatLength(120000)).toBe("120 m");
  });

  it("reads to one decimal of a metre", () => {
    expect(formatLength(107200)).toBe("107.2 m");
  });

  it("rounds below a tenth of a metre", () => {
    expect(formatLength(18440)).toBe("18.4 m");
  });
});
