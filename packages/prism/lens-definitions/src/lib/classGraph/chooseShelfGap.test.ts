import { describe, expect, it } from "vitest";
import chooseShelfGap from "./chooseShelfGap.js";
import { BRIDGE_GAP_ROOM, SHELF_GAP } from "./constants.js";

// Three boxes on the shelf passed, 48px apart: gaps at 160 to 208 and 368
// to 416, the margins at -24 and 600.
const SHELF = [
  { left: 0, right: 160 },
  { left: 208, right: 368 },
  { left: 416, right: 576 },
];
const MARGINS: readonly [number, number] = [-SHELF_GAP / 2, 600];

describe("chooseShelfGap", () => {
  it("takes the free gap between two boxes nearest the bridge's way", () => {
    expect(chooseShelfGap(SHELF, 380, 420, MARGINS, new Map())).toEqual({
      base: 392,
      room: BRIDGE_GAP_ROOM,
    });
    expect(chooseShelfGap(SHELF, 100, 150, MARGINS, new Map()).base).toBe(184);
  });

  it("passes a gap with no room left for its lane for the next nearest", () => {
    expect(
      chooseShelfGap(SHELF, 380, 420, MARGINS, new Map([[392, 9]])).base,
    ).toBe(184);
  });

  it("goes round the nearer margin where no shelf passed leaves a gap", () => {
    const wide = [{ left: 0, right: 560 }];
    expect(chooseShelfGap(wide, 500, 540, MARGINS, new Map()).base).toBe(600);
    expect(chooseShelfGap(wide, 20, 40, MARGINS, new Map()).base).toBe(-24);
  });

  it("keeps a gap free on every shelf passed", () => {
    // The second shelf's box closes the gap at 184: only 392 is free on both.
    const two = [...SHELF, { left: 120, right: 300 }];
    expect(chooseShelfGap(two, 100, 150, MARGINS, new Map()).base).toBe(392);
  });
});
