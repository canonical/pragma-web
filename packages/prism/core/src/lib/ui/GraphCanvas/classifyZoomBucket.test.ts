import { describe, expect, it } from "vitest";
import classifyZoomBucket from "./classifyZoomBucket.js";

describe("classifyZoomBucket", () => {
  it("shows no text below the scale at which 16px text renders at 12px", () => {
    expect(classifyZoomBucket(0.5)).toBe("overview");
    expect(classifyZoomBucket(0.7499)).toBe("overview");
  });

  it("shows only 16px text below the scale at which 14px text renders at 12px", () => {
    expect(classifyZoomBucket(0.75)).toBe("hubs");
    expect(classifyZoomBucket(0.857)).toBe("hubs");
  });

  it("shows every text from 12/14 up", () => {
    expect(classifyZoomBucket(12 / 14)).toBe("full");
    expect(classifyZoomBucket(2.4)).toBe("full");
  });
});
