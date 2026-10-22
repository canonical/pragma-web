// @vitest-environment node

import { describe, expect, it } from "vitest";
import spaceStripStops from "./spaceStripStops.js";

describe("spaceStripStops", () => {
  it("spaces stops evenly and runs the rule from the first to the last", () => {
    expect(spaceStripStops(4, false)).toEqual({
      ruleStart: 0.125,
      ruleEnd: 0.875,
      stops: [0.125, 0.375, 0.625, 0.875],
    });
  });

  it("runs a loop's rule to both edges, where the service continues", () => {
    expect(spaceStripStops(2, true)).toEqual({
      ruleStart: 0,
      ruleEnd: 1,
      stops: [0.25, 0.75],
    });
  });

  it("centres a single stop", () => {
    expect(spaceStripStops(1, false)).toEqual({
      ruleStart: 0.5,
      ruleEnd: 0.5,
      stops: [0.5],
    });
  });

  it("throws on no stops or a fractional count", () => {
    expect(() => spaceStripStops(0, false)).toThrow(/at least one stop/);
    expect(() => spaceStripStops(1.5, true)).toThrow(/at least one stop/);
  });
});
