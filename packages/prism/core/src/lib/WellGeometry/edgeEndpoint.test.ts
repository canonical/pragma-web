import { describe, expect, it } from "vitest";
import { edgeEndpoint } from "./edgeEndpoint.js";
import type { WellBox } from "./types.js";

const box: WellBox = { x: 100, y: 100, width: 40, height: 20 };

describe("edgeEndpoint", () => {
  it("returns the centre for a degenerate segment", () => {
    expect(edgeEndpoint(box, { x: 100, y: 100 }, 4)).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("meets a vertical segment at the top or bottom border, plus the gap", () => {
    expect(edgeEndpoint(box, { x: 100, y: 0 }, 4)).toEqual({ x: 100, y: 86 });
    expect(edgeEndpoint(box, { x: 100, y: 200 }, 4)).toEqual({
      x: 100,
      y: 114,
    });
  });

  it("meets a horizontal segment at the side border, plus the gap", () => {
    expect(edgeEndpoint(box, { x: 300, y: 100 }, 4)).toEqual({
      x: 124,
      y: 100,
    });
    expect(edgeEndpoint(box, { x: 0, y: 100 }, 4)).toEqual({ x: 76, y: 100 });
  });

  it("leaves a diagonal through the nearer border", () => {
    // Half extents 24 × 14 with the gap: the segment to (200, 200) leaves
    // through the bottom (t = 14 / 100) before the side (t = 24 / 100).
    expect(edgeEndpoint(box, { x: 200, y: 200 }, 4)).toEqual({
      x: 114,
      y: 114,
    });
  });

  it("never overshoots a point inside the box", () => {
    expect(edgeEndpoint(box, { x: 105, y: 102 }, 4)).toEqual({
      x: 105,
      y: 102,
    });
  });
});
