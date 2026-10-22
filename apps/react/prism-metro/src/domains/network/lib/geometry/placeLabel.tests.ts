// @vitest-environment node

import { describe, expect, it } from "vitest";
import { LABEL_GAP } from "./constants.js";
import placeLabel from "./placeLabel.js";

const CENTRE = { x: 100, y: 50 };
const EAST = { x: 1, y: 0 };
const WEST = { x: -1, y: 0 };
const NORTH = { x: 0, y: -1 };
const SOUTH = { x: 0, y: 1 };
const DIAGONALS = [
  { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
  { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
];

describe("placeLabel", () => {
  it("puts the name east of a station no track leaves eastward", () => {
    expect(placeLabel(CENTRE, 4, 4, [WEST])).toEqual({
      x: 100 + 4 + LABEL_GAP,
      y: 50,
      anchor: "start",
    });
  });

  it("puts the name west, ending at the mark, when a track leaves east", () => {
    expect(placeLabel(CENTRE, 4, 4, [EAST])).toEqual({
      x: 100 - 4 - LABEL_GAP,
      y: 50,
      anchor: "end",
    });
  });

  it("centres the name above a station on a horizontal track", () => {
    expect(placeLabel(CENTRE, 7, 4, [EAST, WEST])).toEqual({
      x: 100,
      y: 50 - 4 - LABEL_GAP,
      anchor: "middle",
    });
  });

  it("treats a track within 22.5° of a direction as blocking it", () => {
    const nearlyEast = { x: Math.cos(0.3), y: Math.sin(0.3) };
    expect(placeLabel(CENTRE, 4, 4, [nearlyEast]).anchor).toBe("end");
    expect(placeLabel(CENTRE, 4, 4, [DIAGONALS[0] as typeof EAST]).anchor).toBe(
      "start",
    );
  });

  it("falls back to east when every direction is taken", () => {
    expect(
      placeLabel(CENTRE, 4, 4, [EAST, WEST, NORTH, SOUTH, ...DIAGONALS]).anchor,
    ).toBe("start");
  });
});
