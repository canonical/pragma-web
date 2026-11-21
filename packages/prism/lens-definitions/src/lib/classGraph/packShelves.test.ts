import { describe, expect, it } from "vitest";
import { DESIGN_CANVAS, VIEW_MARGIN } from "./constants.js";
import packShelves from "./packShelves.js";

describe("packShelves", () => {
  it("keeps the shelf break that fits the design canvas at the largest zoom", () => {
    const beside = packShelves([
      { w: 200, h: 600 },
      { w: 200, h: 600 },
    ]);
    expect(beside).toMatchObject({ shelves: [[0, 1]], w: 448, h: 600 });
    const stacked = packShelves([
      { w: 500, h: 96 },
      { w: 500, h: 96 },
    ]);
    expect(stacked).toMatchObject({ shelves: [[0], [1]], w: 500, h: 240 });
    expect(stacked.fit).toBeCloseTo(DESIGN_CANVAS.w / (500 + 2 * VIEW_MARGIN));
  });

  it("prefers fewer shelves on a tie", () => {
    // Beside, the pair is bound by its width; stacked, by its height: both
    // at a zoom of 2 on the design canvas.
    const tall = { w: DESIGN_CANVAS.w / 2 - 96, h: DESIGN_CANVAS.h / 2 - 96 };
    const packing = packShelves([tall, { w: 16, h: 16 }]);
    expect(packing.fit).toBeCloseTo(2);
    expect(packing.shelves).toEqual([[0, 1]]);
  });

  it("packs forty regions, in order, without trying every break", () => {
    const sizes = Array.from({ length: 40 }, (_, index) => ({
      w: 16 * (5 + ((index * 7) % 30)),
      h: 16 * (5 + ((index * 11) % 30)),
    }));
    const packing = packShelves(sizes);
    expect(packing.shelves.flat()).toEqual(sizes.map((_, index) => index));
    expect(packing.fit).toBeGreaterThan(0);
  });

  it("wraps a shelf of several regions at the width given, a wider region alone", () => {
    const sizes = [
      { w: 800, h: 400 },
      { w: 160, h: 48 },
      { w: 160, h: 48 },
      { w: 160, h: 48 },
      { w: 160, h: 48 },
    ];
    const packing = packShelves(sizes, { maxWidth: 480 });
    for (const shelf of packing.shelves) {
      const w =
        shelf.reduce((sum, index) => sum + (sizes[index]?.w ?? 0), 0) +
        48 * (shelf.length - 1);
      if (shelf.length > 1) expect(w).toBeLessThanOrEqual(480);
    }
    expect(packing.shelves.flat()).toEqual([0, 1, 2, 3, 4]);
    // Unbounded, the four boxes share one shelf as wide as the first.
    expect(packShelves(sizes).shelves.some((shelf) => shelf.length === 4)).toBe(
      true,
    );
  });

  it("refuses to pack nothing", () => {
    expect(() => packShelves([])).toThrow(/no region to pack/);
  });
});
