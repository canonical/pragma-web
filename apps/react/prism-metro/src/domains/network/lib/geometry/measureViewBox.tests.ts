// @vitest-environment node

import { describe, expect, it } from "vitest";
import { MARGIN } from "./constants.js";
import measureViewBox from "./measureViewBox.js";

describe("measureViewBox", () => {
  it("fits the box around every point with the margin on every side", () => {
    expect(
      measureViewBox([
        { x: 0, y: 0 },
        { x: 100, y: 50 },
        { x: -4, y: 10 },
      ]),
    ).toBe([-4 - MARGIN, -MARGIN, 104 + 2 * MARGIN, 50 + 2 * MARGIN].join(" "));
  });

  it("throws on an empty drawing", () => {
    expect(() => measureViewBox([])).toThrow(/empty drawing/);
  });
});
