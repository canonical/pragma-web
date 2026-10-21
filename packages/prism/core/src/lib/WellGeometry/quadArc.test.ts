import { describe, expect, it } from "vitest";
import { quadArc } from "./quadArc.js";

describe("quadArc", () => {
  it("bows the control point off the chord and labels the apex", () => {
    const arc = quadArc({ x: 0, y: 0 }, { x: 100, y: 0 }, 30);
    expect(arc.d).toBe("M 0 0 Q 50 30 100 0");
    // The apex of the curve sits halfway to the control point, lifted 6px.
    expect(arc.labelAt).toEqual({ x: 50, y: 9 });
  });

  it("swells the other way for a negative bow", () => {
    expect(quadArc({ x: 0, y: 0 }, { x: 100, y: 0 }, -30).d).toBe(
      "M 0 0 Q 50 -30 100 0",
    );
  });

  it("settles every coordinate to a tenth of a px", () => {
    expect(quadArc({ x: 0.04, y: 0 }, { x: 10.06, y: 0 }, 0).d).toBe(
      "M 0 0 Q 5.1 0 10.1 0",
    );
  });

  it("survives a zero-length chord without dividing by zero", () => {
    const arc = quadArc({ x: 5, y: 5 }, { x: 5, y: 5 }, 30);
    expect(arc.d).toBe("M 5 5 Q 5 5 5 5");
    expect(arc.labelAt).toEqual({ x: 5, y: -1 });
  });
});
