import { describe, expect, it } from "vitest";
import buildQuadArc from "./buildQuadArc.js";

describe("buildQuadArc", () => {
  it("bows the control point off the chord and labels the apex", () => {
    const arc = buildQuadArc({ x: 0, y: 0 }, { x: 100, y: 0 }, 30);
    expect(arc.d).toBe("M 0 0 Q 50 30 100 0");
    // The apex of the curve sits halfway to the control point, lifted 6px.
    expect(arc.labelAt).toEqual({ x: 50, y: 9 });
  });

  it("swells the other way for a negative bow", () => {
    expect(buildQuadArc({ x: 0, y: 0 }, { x: 100, y: 0 }, -30).d).toBe(
      "M 0 0 Q 50 -30 100 0",
    );
  });

  it("bows a vertical chord off its perpendicular bisector", () => {
    const arc = buildQuadArc({ x: 0, y: 0 }, { x: 0, y: 100 }, 30);
    expect(arc.d).toBe("M 0 0 Q -30 50 0 100");
    expect(arc.labelAt).toEqual({ x: -15, y: 44 });
  });

  it("bows a diagonal chord along its unit normal", () => {
    // A 3-4-5 chord: the unit normal is (-0.8, 0.6), so a 10px bow moves
    // the control point from the midpoint (15, 20) to (7, 26).
    expect(buildQuadArc({ x: 0, y: 0 }, { x: 30, y: 40 }, 10).d).toBe(
      "M 0 0 Q 7 26 30 40",
    );
  });

  it("settles every coordinate to a tenth of a px", () => {
    expect(buildQuadArc({ x: 0.04, y: 0 }, { x: 10.06, y: 0 }, 0).d).toBe(
      "M 0 0 Q 5.1 0 10.1 0",
    );
  });

  it("survives a zero-length chord without dividing by zero", () => {
    const arc = buildQuadArc({ x: 5, y: 5 }, { x: 5, y: 5 }, 30);
    expect(arc.d).toBe("M 5 5 Q 5 5 5 5");
    expect(arc.labelAt).toEqual({ x: 5, y: -1 });
  });
});
