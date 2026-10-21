import { describe, expect, it } from "vitest";
import relaxBoxes from "./relaxBoxes.js";
import type { WellBox } from "./types.js";

/** A 20 × 20 box centred at (`x`, `y`). */
const buildSquare = (x: number, y: number): WellBox => ({
  x,
  y,
  width: 20,
  height: 20,
});

describe("relaxBoxes", () => {
  it("leaves boxes that do not overlap where they are", () => {
    const boxes = [buildSquare(0, 0), buildSquare(100, 0)];
    relaxBoxes(boxes, { gap: 4, iterations: 8 });
    expect(boxes).toEqual([buildSquare(0, 0), buildSquare(100, 0)]);
  });

  it("pushes apart along x when the x overlap is the smaller", () => {
    // Overlap x = 24 - 16 = 8, y = 24 - 2 = 22: x is the axis of least
    // overlap, and each box takes half.
    const boxes = [buildSquare(0, 0), buildSquare(16, 2)];
    relaxBoxes(boxes, { gap: 4, iterations: 1 });
    expect(boxes.map(({ x, y }) => [x, y])).toEqual([
      [-4, 0],
      [20, 2],
    ]);
  });

  it("pushes apart along y when the y overlap is the smaller", () => {
    const boxes = [buildSquare(0, 0), buildSquare(2, 16)];
    relaxBoxes(boxes, { gap: 4, iterations: 1 });
    expect(boxes.map(({ x, y }) => [x, y])).toEqual([
      [0, -4],
      [2, 20],
    ]);
  });

  it("pushes the first box the other way when it sits after the second", () => {
    const boxes = [buildSquare(16, 0), buildSquare(0, 2)];
    relaxBoxes(boxes, { gap: 4, iterations: 1 });
    expect(boxes.map(({ x }) => x)).toEqual([20, -4]);

    const stacked = [buildSquare(0, 16), buildSquare(2, 0)];
    relaxBoxes(stacked, { gap: 4, iterations: 1 });
    expect(stacked.map(({ y }) => y)).toEqual([20, -4]);
  });

  it("moves only the partner of a pinned box, by the full overlap", () => {
    const pinnedFirst = [buildSquare(0, 0), buildSquare(16, 2)];
    relaxBoxes(pinnedFirst, { gap: 4, iterations: 1, pinned: new Set([0]) });
    expect(pinnedFirst.map(({ x }) => x)).toEqual([0, 24]);

    const pinnedSecond = [buildSquare(0, 0), buildSquare(16, 2)];
    relaxBoxes(pinnedSecond, { gap: 4, iterations: 1, pinned: new Set([1]) });
    expect(pinnedSecond.map(({ x }) => x)).toEqual([-8, 16]);
  });

  it("moves neither box of a pair that is pinned at both ends", () => {
    const boxes = [buildSquare(0, 0), buildSquare(16, 2)];
    relaxBoxes(boxes, { gap: 4, iterations: 4, pinned: new Set([0, 1]) });
    expect(boxes).toEqual([buildSquare(0, 0), buildSquare(16, 2)]);
  });

  it("stops early once a pass moves nothing", () => {
    // One pass separates the pair; a generous budget must not move them on.
    const boxes = [buildSquare(0, 0), buildSquare(16, 2)];
    relaxBoxes(boxes, { gap: 4, iterations: 100 });
    expect(boxes.map(({ x, y }) => [x, y])).toEqual([
      [-4, 0],
      [20, 2],
    ]);
  });

  it("spends no more passes than its budget", () => {
    // Three boxes on one spot need several passes; a budget of one leaves
    // the first and third still overlapping.
    const boxes = [buildSquare(0, 0), buildSquare(1, 0), buildSquare(2, 0)];
    relaxBoxes(boxes, { gap: 0, iterations: 1 });
    const [first, , third] = boxes;
    expect(Math.abs((third?.x ?? 0) - (first?.x ?? 0))).toBeLessThan(20);
  });

  it("throws on a hole in the box list", () => {
    const boxes: WellBox[] = [buildSquare(0, 0)];
    boxes.length = 2;
    expect(() => relaxBoxes(boxes, { gap: 4, iterations: 1 })).toThrow(
      "relaxBoxes: no box at index 1",
    );
  });
});
