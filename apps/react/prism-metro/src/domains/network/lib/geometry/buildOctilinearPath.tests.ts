// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildOctilinearPath from "./buildOctilinearPath.js";
import type { GridPoint } from "./types.js";

/** Whether a leg runs horizontally, vertically or at 45°. */
const isOctilinear = (from: GridPoint, to: GridPoint): boolean => {
  const run = Math.abs(to.x - from.x);
  const rise = Math.abs(to.y - from.y);
  return run === 0 || rise === 0 || run === rise;
};

describe("buildOctilinearPath", () => {
  it("keeps a horizontal, a vertical and a diagonal pair as one leg", () => {
    expect(buildOctilinearPath({ x: 0, y: 0 }, { x: 4, y: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(buildOctilinearPath({ x: 0, y: 3 }, { x: 0, y: 6 })).toHaveLength(2);
    expect(buildOctilinearPath({ x: 4, y: 5 }, { x: 0, y: 9 })).toHaveLength(2);
  });

  it("bends once, diagonal first, where the pair is off every octilinear line", () => {
    expect(buildOctilinearPath({ x: 0, y: 0 }, { x: 5, y: 2 })).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 5, y: 2 },
    ]);
    expect(buildOctilinearPath({ x: 0, y: 0 }, { x: -1, y: -4 })).toEqual([
      { x: 0, y: 0 },
      { x: -1, y: -1 },
      { x: -1, y: -4 },
    ]);
  });

  it("returns only octilinear legs, from the start to the end", () => {
    const ends: readonly [GridPoint, GridPoint][] = [
      [
        { x: 3, y: 1 },
        { x: -2, y: 7 },
      ],
      [
        { x: 0, y: 0 },
        { x: 7, y: -3 },
      ],
      [
        { x: 2, y: 2 },
        { x: 2, y: 2 },
      ],
    ];
    for (const [from, to] of ends) {
      const path = buildOctilinearPath(from, to);
      expect(path.at(0)).toEqual(from);
      expect(path.at(-1)).toEqual(to);
      path.slice(1).forEach((point, index) => {
        expect(isOctilinear(path.at(index) as GridPoint, point)).toBe(true);
      });
    }
  });
});
