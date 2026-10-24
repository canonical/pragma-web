import { describe, expect, it } from "vitest";
import {
  averageOf,
  buildArrowhead,
  ceilTo,
  compareText,
  containsPoint,
  findCentredBaseline,
  findPointOnPath,
  flattenPath,
  formatPathData,
  insetRect,
  intersectsRect,
  measurePathBounds,
  measureTextBox,
  measureTextWidth,
  orderBy,
  parsePathData,
  roundTo,
  samplePath,
  uniteRects,
} from "./geometry.js";

describe("measureTextWidth", () => {
  it("measures bold 14px labels from the shipped font's advances", () => {
    expect(
      Math.round(measureTextWidth("Implementation Library", "bold", 14)),
    ).toBe(155);
    expect(Math.round(measureTextWidth("Change Log Entry", "bold", 14))).toBe(
      116,
    );
    expect(Math.round(measureTextWidth("Component", "bold", 14))).toBe(77);
  });

  it("measures a character outside the table at 0.6em", () => {
    expect(measureTextWidth("é", "regular", 10)).toBe(6);
  });

  it("measures figures at their tabular advance when asked", () => {
    const proportional = measureTextWidth("11", "regular", 14);
    const tabular = measureTextWidth("11", "regular", 14, true);
    expect(tabular).toBeGreaterThanOrEqual(proportional);
    expect(measureTextWidth("1", "bold", 14, true)).toBe(
      measureTextWidth("8", "bold", 14, true),
    );
  });
});

describe("measureTextBox", () => {
  it("spans the em box from ascender to descender", () => {
    const box = measureTextBox(10, 20, 30, 10);
    expect(box).toMatchObject({ x: 10, w: 30, h: 12 });
    expect(box.y).toBeCloseTo(10.6);
  });
});

describe("findCentredBaseline", () => {
  it("centres the em box in its row", () => {
    expect(findCentredBaseline(32, 14)).toBe(21);
  });
});

describe("ceilTo and roundTo", () => {
  it("round to a step", () => {
    expect(ceilTo(97, 16)).toBe(112);
    expect(ceilTo(96, 16)).toBe(96);
    expect(roundTo(56, 16)).toBe(64);
    expect(roundTo(40, 16)).toBe(48);
  });
});

describe("formatPathData", () => {
  it("writes commands, translated", () => {
    expect(
      formatPathData(
        [
          ["M", 0, 0],
          ["H", 4],
          ["V", 8],
          ["L", 1, 2],
          ["C", 1, 2, 3, 4, 5, 6],
        ],
        10,
        20,
      ),
    ).toBe("M10 20H14V28L11 22C11 22 13 24 15 26");
  });

  it("refuses a coordinate off the integer grid", () => {
    expect(() => formatPathData([["M", 0.5, 0]])).toThrow(
      /0\.5, not an integer/,
    );
  });
});

describe("buildArrowhead", () => {
  it("points its tip at the side it touches", () => {
    expect(formatPathData(buildArrowhead(10, 20, true))).toBe(
      "M10 20L2 16V24L10 20",
    );
    expect(formatPathData(buildArrowhead(10, 20, false))).toBe(
      "M10 20L18 16V24L10 20",
    );
  });
});

describe("parsePathData and flattenPath", () => {
  it("reads subpaths of lines and cubics", () => {
    const parsed = parsePathData("M0 0H10V10L0 10M20 0C20 10 30 10 30 0");
    expect(parsed).toHaveLength(2);
    expect(parsed.at(0)?.segments.map((segment) => segment.kind)).toEqual([
      "line",
      "line",
      "line",
    ]);
    expect(parsed.at(1)?.segments.at(0)?.kind).toBe("cubic");
    const [lines, curve] = flattenPath(
      "M0 0H10V10L0 10M20 0C20 10 30 10 30 0",
      4,
    );
    expect(lines).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]);
    expect(curve).toHaveLength(5);
    expect(curve?.at(-1)).toEqual([30, 0]);
  });

  it("repeats the last command for coordinates that follow it", () => {
    expect(flattenPath("M0 0L1 1 2 2")).toEqual([
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    ]);
  });

  it("reads nothing from empty path data", () => {
    expect(parsePathData("")).toEqual([]);
  });
});

describe("samplePath, findPointOnPath and measurePathBounds", () => {
  it("samples a line every step, its ends included", () => {
    expect(samplePath("M0 0H10", 4)).toEqual([
      [0, 0],
      [4, 0],
      [8, 0],
      [10, 0],
    ]);
  });

  it("finds a point by its share of the length", () => {
    expect(findPointOnPath("M0 0H10V10", 0.75)).toEqual([10, 5]);
    expect(findPointOnPath("M0 0H10", 2)).toEqual([10, 0]);
    expect(findPointOnPath("M0 0M0 0", 0.5)).toEqual([0, 0]);
  });

  it("finds the start of a zero-length path", () => {
    expect(findPointOnPath("M3 4L3 4", 0)).toEqual([3, 4]);
  });

  it("bounds a path", () => {
    expect(measurePathBounds("M0 0C0 10 10 10 10 0")).toEqual({
      x: 0,
      y: 0,
      w: 10,
      h: 7.5,
    });
  });
});

describe("rectangles", () => {
  const box = { x: 0, y: 0, w: 10, h: 10 };

  it("inset, contain, intersect and unite", () => {
    expect(insetRect(box, 2)).toEqual({ x: 2, y: 2, w: 6, h: 6 });
    expect(containsPoint([5, 5], box)).toBe(true);
    expect(containsPoint([10, 5], box)).toBe(false);
    expect(intersectsRect(box, { x: 9, y: 9, w: 5, h: 5 })).toBe(true);
    expect(intersectsRect(box, { x: 10, y: 0, w: 5, h: 5 })).toBe(false);
    expect(uniteRects([box, { x: 20, y: -5, w: 5, h: 5 }])).toEqual({
      x: 0,
      y: -5,
      w: 25,
      h: 15,
    });
  });
});

describe("compareText, averageOf and orderBy", () => {
  it("order by code unit and average", () => {
    expect(["b", "a", "a"].sort(compareText)).toEqual(["a", "a", "b"]);
    expect(compareText("a", "a")).toBe(0);
    expect(averageOf([1, 2, 6])).toBe(3);
  });

  it("order by the first comparison that differs, ties at zero", () => {
    expect(orderBy(0, -2, 5)).toBe(-2);
    expect(orderBy(0, 0)).toBe(0);
  });
});
