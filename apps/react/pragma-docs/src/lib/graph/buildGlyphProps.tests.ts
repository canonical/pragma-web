import { describe, expect, it } from "vitest";
import buildGlyphProps from "./buildGlyphProps.js";

describe("buildGlyphProps", () => {
  it("draws on a 16-unit box at the size asked, in the current colour", () => {
    expect(buildGlyphProps(15)).toEqual({
      fill: "none",
      height: 15,
      stroke: "currentColor",
      strokeWidth: 1.6,
      viewBox: "0 0 16 16",
      width: 15,
    });
  });
});
