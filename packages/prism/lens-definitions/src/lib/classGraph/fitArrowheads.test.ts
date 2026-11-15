import { describe, expect, it } from "vitest";
import fitArrowheads from "./fitArrowheads.js";

/** A route from a box's right side to another's left, a head at each end. */
const ROUTE = "M100 40H140V88H180";

/** The layout's 8px heads at both ends of `ROUTE`. */
const HEADS = ["M100 40L108 36V44L100 40", "M180 88L172 84V92L180 88"];

/** A phone arc: two cubics out of the spine and back, a head at its end. */
const ARC = "M192 40C224 40 224 40 224 56C224 72 224 88 192 88";

describe("fitArrowheads", () => {
  it("keeps the layout's path and heads for a stroke up to 2px", () => {
    for (const width of [1, 2] as const) {
      expect(fitArrowheads(ROUTE, HEADS, width)).toEqual({
        d: ROUTE,
        heads: HEADS,
      });
    }
  });

  it("grows each head about its tip and ends an 8px line inside it", () => {
    expect(fitArrowheads(ROUTE, HEADS, 8)).toEqual({
      d: "M108 40L140 40L140 88L172 88",
      heads: ["M100 40L120 30V50L100 40", "M180 88L160 78V98L180 88"],
    });
  });

  it("grows a 4px line's heads by half and stops it 4px short", () => {
    expect(fitArrowheads(ROUTE, HEADS, 4)).toEqual({
      d: "M104 40L140 40L140 88L176 88",
      heads: ["M100 40L112 34V46L100 40", "M180 88L168 82V94L180 88"],
    });
  });

  it("shortens only the ends that hold a head, along a curve's last point", () => {
    expect(fitArrowheads(ARC, ["M192 88L200 84V92L192 88"], 8)).toEqual({
      d: "M192 40C224 40 224 40 224 56C224 72 224 88 200 88",
      heads: ["M192 88L212 78V98L192 88"],
    });
  });

  it("refuses a relation of more than one subpath", () => {
    expect(() => fitArrowheads("M0 0H8M16 0H24", HEADS, 8)).toThrow(
      "one subpath",
    );
  });
});
