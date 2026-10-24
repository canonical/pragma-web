import { describe, expect, it } from "vitest";
import { LEGIBLE_ZOOM } from "./constants.js";
import frameOpeningCamera from "./frameOpeningCamera.js";

const BOUNDS = { x: -16, y: -16, width: 1168, height: 1200 };

describe("frameOpeningCamera", () => {
  it("opens a large graph at the legible zoom on screen, from its top-left", () => {
    // The viewport shows 1168 by 600 user units at the identity, half a
    // pixel each: the whole graph would open at 0.5.
    const visible = { x: -16, y: -16, width: 1168, height: 600 };
    const camera = frameOpeningCamera(BOUNDS, undefined, visible, 0.5);
    expect(camera.k * 0.5).toBeCloseTo(LEGIBLE_ZOOM, 9);
    // The graph's top-left corner lands on the viewport's.
    expect(-16 * camera.k + camera.x).toBeCloseTo(visible.x, 9);
    expect(-16 * camera.k + camera.y).toBeCloseTo(visible.y, 9);
  });

  it("keeps the identity's fit when the whole graph is legible", () => {
    const small = { x: -16, y: -16, width: 400, height: 200 };
    const visible = { x: -16, y: -16, width: 400, height: 300 };
    const camera = frameOpeningCamera(small, undefined, visible, 1);
    expect(camera).toEqual({ k: 1, x: 0, y: 0 });
  });
});
