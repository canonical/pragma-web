import { describe, expect, it } from "vitest";
import packShelves from "./packShelves.js";

describe("packShelves", () => {
  it("keeps the shelf break that fits the design canvas at the largest zoom", () => {
    const beside = packShelves([
      { w: 400, h: 400 },
      { w: 400, h: 400 },
    ]);
    expect(beside).toMatchObject({ shelves: [[0, 1]], w: 848, h: 400 });
    const stacked = packShelves([
      { w: 800, h: 96 },
      { w: 800, h: 96 },
    ]);
    expect(stacked).toMatchObject({ shelves: [[0], [1]], w: 800, h: 240 });
    expect(stacked.fit).toBeCloseTo(868 / 832);
  });

  it("prefers fewer shelves on a tie", () => {
    expect(
      packShelves([
        { w: 16, h: 16 },
        { w: 16, h: 16 },
      ]).shelves,
    ).toEqual([[0, 1]]);
  });

  it("refuses to pack nothing", () => {
    expect(() => packShelves([])).toThrow(/no region to pack/);
  });
});
