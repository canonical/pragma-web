import { describe, expect, it } from "vitest";
import { LEGIBLE_ZOOM } from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";

const CANVAS = { width: 600, height: 400 };

describe("frameLegibleWindow", () => {
  it("frames the whole graph when it fits at the legible zoom", () => {
    const bounds = { x: -16, y: -16, width: 600, height: 300 };
    expect(frameLegibleWindow(bounds, CANVAS, undefined)).toBe(bounds);
  });

  it("frames a window from the top-left that shows at the legible zoom", () => {
    const bounds = { x: -16, y: -16, width: 1168, height: 1200 };
    const window = frameLegibleWindow(bounds, CANVAS, undefined);
    expect(window.x).toBe(-16);
    expect(window.y).toBe(-16);
    expect(
      Math.min(CANVAS.width / window.width, CANVAS.height / window.height),
    ).toBeCloseTo(LEGIBLE_ZOOM, 9);
  });

  it("keeps a short, wide graph's height and cuts only its width", () => {
    const bounds = { x: -16, y: -16, width: 1168, height: 272 };
    const window = frameLegibleWindow(bounds, CANVAS, undefined);
    expect(window.height).toBe(272);
    expect(window.width).toBeCloseTo(CANVAS.width / LEGIBLE_ZOOM, 9);
  });

  it("centres the window on the selected hop's row", () => {
    const bounds = { x: -16, y: -16, width: 1168, height: 1600 };
    const selected = { x: 240, y: 768, width: 176, height: 48 };
    const window = frameLegibleWindow(bounds, CANVAS, selected);
    expect(window.y + window.height / 2).toBeCloseTo(792, 9);
  });

  it("keeps the window inside the graph near its top and its bottom", () => {
    const bounds = { x: -16, y: -16, width: 1168, height: 1600 };
    const top = frameLegibleWindow(bounds, CANVAS, {
      x: 240,
      y: 0,
      width: 176,
      height: 48,
    });
    expect(top.y).toBe(-16);
    const bottom = frameLegibleWindow(bounds, CANVAS, {
      x: 240,
      y: 1520,
      width: 176,
      height: 48,
    });
    expect(bottom.y + bottom.height).toBeCloseTo(1584, 9);
  });
});
