// @vitest-environment node

import { describe, expect, it } from "vitest";
import { LABEL_CHARACTER_WIDTH, LABEL_GAP, LABEL_SIZE } from "./constants.js";
import placeLabel from "./placeLabel.js";
import type { DrawingPoint, MarkBox } from "./types.js";

/** A four-unit-square mark centred on (100, 50), for a station named `title`. */
const makeMark = (title = "Kiln"): MarkBox => ({
  stop: {
    uri: "urn:kiln",
    curie: "kiln",
    title,
    isInterchange: false,
    position: { x: 0, y: 0 },
  },
  shape: "dot",
  x: 96,
  y: 46,
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
  it("puts the name east, starting one gap past the mark", () => {
    expect(placeLabel(makeMark(), [WEST], [])).toEqual({
      x: 104 + LABEL_GAP,
      y: 50,
      anchor: "start",
      box: {
        x: 104 + LABEL_GAP,
        y: 50 - LABEL_SIZE / 2,
        width: WIDTH,
        height: LABEL_SIZE,
      },
    });
  });

  it("puts the name west, ending at the mark, when a track leaves east", () => {
    const label = placeLabel(makeMark(), [EAST], []);
    expect(label).toMatchObject({ x: 96 - LABEL_GAP, anchor: "end" });
    expect(label.box.x).toBeCloseTo(96 - LABEL_GAP - WIDTH);
  });

  it("centres the name above a station on a horizontal track, clear of it", () => {
    const label = placeLabel(makeMark(), [EAST, WEST], []);
    expect(label.anchor).toBe("middle");
    expect(label.box.y + label.box.height).toBe(46 - LABEL_GAP);
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
