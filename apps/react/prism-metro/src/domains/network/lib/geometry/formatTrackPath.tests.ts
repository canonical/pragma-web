// @vitest-environment node

import { describe, expect, it } from "vitest";
import formatTrackPath from "./formatTrackPath.js";

describe("formatTrackPath", () => {
  it("moves to the first vertex and draws a line to each next", () => {
    expect(
      formatTrackPath(
        [
          { x: 0, y: 3 },
          { x: 48, y: 3 },
        ],
        false,
      ),
    ).toBe("M0 3 L48 3");
  });

  it("closes a loop and rounds to two decimals", () => {
    expect(
      formatTrackPath(
        [
          { x: 0, y: 0 },
          { x: 1.23456, y: 0 },
          { x: 0, y: 2 / 3 },
        ],
        true,
      ),
    ).toBe("M0 0 L1.23 0 L0 0.67 Z");
  });
});
