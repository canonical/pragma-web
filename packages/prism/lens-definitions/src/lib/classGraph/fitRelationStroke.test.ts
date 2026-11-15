import { describe, expect, it } from "vitest";
import fitRelationStroke from "./fitRelationStroke.js";

/** A route from a box's right side to another's left, a head at its end. */
const ROUTE = "M100 40H140V88H180";

/** The layout's 8px head at the end of `ROUTE`. */
const HEADS = ["M180 88L172 84V92L180 88"];

describe("fitRelationStroke", () => {
  it("draws a relation no store counts at the lightest solid stroke", () => {
    expect(fitRelationStroke(ROUTE, HEADS, undefined)).toEqual({
      d: ROUTE,
      heads: HEADS,
      width: 1,
      dash: undefined,
    });
  });

  it("dashes a relation with no statements, at 1px on the layout's path", () => {
    expect(fitRelationStroke(ROUTE, HEADS, { width: 1, dashed: true })).toEqual(
      { d: ROUTE, heads: HEADS, width: 1, dash: "4 4" },
    );
  });

  it("ends a heavy relation inside its grown head", () => {
    expect(
      fitRelationStroke(ROUTE, HEADS, { width: 8, dashed: false }),
    ).toEqual({
      d: "M100 40L140 40L140 88L172 88",
      heads: ["M180 88L160 78V98L180 88"],
      width: 8,
      dash: undefined,
    });
  });
});
