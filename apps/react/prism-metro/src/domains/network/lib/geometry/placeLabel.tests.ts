// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  GRID_UNIT,
  LABEL_CHARACTER_WIDTH,
  LABEL_GAP,
  LABEL_SIZE,
} from "./constants.js";
import placeLabel from "./placeLabel.js";
import type { DrawingPoint, MarkBox } from "./types.js";

/** An eight-unit-square mark centred on the dot (96, 48), for a station named `title`. */
const makeMark = (title = "Kiln"): MarkBox => ({
  stop: {
    uri: "urn:kiln",
    curie: "kiln",
    title,
    isInterchange: false,
    position: { x: 0, y: 0 },
  },
  shape: "dot",
  x: 92,
  y: 44,
  width: 8,
  height: 8,
  radius: 4,
});

const WIDTH = 4 * LABEL_SIZE * LABEL_CHARACTER_WIDTH;
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
const EVERY_DIRECTION = [EAST, WEST, NORTH, SOUTH, ...DIAGONALS];

describe("placeLabel", () => {
  it("puts the name east, on the first dot a gap past the mark", () => {
    // 96 + 4 + 2 = 102, so the first dot east is 112.
    expect(placeLabel(makeMark(), [WEST], [])).toEqual({
      x: 112,
      y: 48,
      anchor: "start",
      box: {
        x: 112,
        y: 48 - LABEL_SIZE / 2,
        width: WIDTH,
        height: LABEL_SIZE,
      },
    });
  });

  it("puts the name west, ending on a dot, when a track leaves east", () => {
    // 96 - 4 - 2 = 90, so the first dot west is 80.
    const label = placeLabel(makeMark(), [EAST], []);
    expect(label).toMatchObject({ x: 80, y: 48, anchor: "end" });
    expect(label.box.x).toBeCloseTo(80 - WIDTH);
  });

  it("centres the name above a station on a horizontal track, clear of it", () => {
    const label = placeLabel(makeMark(), [EAST, WEST], []);
    // 48 - 4 - 2 - 6.5 = 35.5, so the first dot north is 32.
    expect(label).toMatchObject({ x: 96, y: 32, anchor: "middle" });
    expect(label.box.y + label.box.height).toBeLessThanOrEqual(44 - LABEL_GAP);
  });

  it("anchors every name on a lattice dot", () => {
    for (const tracks of [
      [],
      [WEST],
      [EAST],
      [EAST, WEST],
      [EAST, WEST, NORTH],
    ]) {
      const { x, y } = placeLabel(makeMark(), tracks, []);
      expect(Math.abs(x % GRID_UNIT)).toBe(0);
      expect(Math.abs(y % GRID_UNIT)).toBe(0);
    }
  });

  it("treats a track within 22.5° of a direction as blocking it", () => {
    const nearlyEast = { x: Math.cos(0.3), y: Math.sin(0.3) };
    expect(placeLabel(makeMark(), [nearlyEast], []).anchor).toBe("end");
    expect(
      placeLabel(makeMark(), [DIAGONALS[0] as typeof EAST], []).anchor,
    ).toBe("start");
  });

  it("moves the name off a box already taken", () => {
    const eastward = placeLabel(makeMark(), [], []).box;
    expect(placeLabel(makeMark(), [], [eastward]).anchor).toBe("end");
  });

  it("moves the name off a track running through it", () => {
    const eastward = placeLabel(makeMark(), [], []).box;
    const through: readonly [DrawingPoint, DrawingPoint] = [
      { x: eastward.x + 2, y: 0 },
      { x: eastward.x + 2, y: 100 },
    ];
    expect(placeLabel(makeMark(), [], [], [through]).anchor).toBe("end");
  });

  it("moves the name off a track that ends inside it", () => {
    const eastward = placeLabel(makeMark(), [], []).box;
    const ending: readonly [DrawingPoint, DrawingPoint] = [
      { x: eastward.x + 2, y: 50 },
      { x: eastward.x + 2, y: 200 },
    ];
    expect(placeLabel(makeMark(), [], [], [ending]).anchor).toBe("end");
  });

  it("keeps a name clear of other names before clear of tracks", () => {
    const everyTrack: readonly [DrawingPoint, DrawingPoint] = [
      { x: -1000, y: -1000 },
      { x: 1000, y: 1000 },
    ];
    const crossing: readonly [DrawingPoint, DrawingPoint] = [
      { x: -1000, y: 1000 },
      { x: 1000, y: -1000 },
    ];
    const horizontal: readonly [DrawingPoint, DrawingPoint] = [
      { x: -1000, y: 50 },
      { x: 1000, y: 50 },
    ];
    const vertical: readonly [DrawingPoint, DrawingPoint] = [
      { x: 100, y: -1000 },
      { x: 100, y: 1000 },
    ];
    expect(
      placeLabel(
        makeMark(),
        [WEST],
        [],
        [everyTrack, crossing, horizontal, vertical],
      ).anchor,
    ).toBe("start");
  });

  it("keeps the first free direction when every one overlaps", () => {
    const everywhere = { x: -1000, y: -1000, width: 2000, height: 2000 };
    expect(placeLabel(makeMark(), [WEST], [everywhere]).anchor).toBe("start");
  });

  it("falls back to east when every direction is taken by a track", () => {
    expect(placeLabel(makeMark(), EVERY_DIRECTION, []).anchor).toBe("start");
  });
});
