import { describe, expect, it } from "vitest";
import computeFitTransform from "./computeFitTransform.js";

describe("computeFitTransform", () => {
  it("fits the viewBox into a viewport that shows exactly it as the identity", () => {
    const box = { x: -16, y: -16, width: 900, height: 600 };
    expect(computeFitTransform(box, box)).toEqual({ k: 1, x: 0, y: 0 });
  });

  it("fits a region flush top-left, on its binding axis", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    const region = { x: 100, y: 50, width: 400, height: 100 };
    expect(computeFitTransform(visible, region)).toEqual({
      k: 2,
      x: -200,
      y: -100,
    });
  });

  it("keeps the zoom inside the zoom extent", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    expect(
      computeFitTransform(visible, { x: 0, y: 0, width: 16, height: 16 }).k,
    ).toBe(2.4);
    expect(
      computeFitTransform(visible, { x: 0, y: 0, width: 8000, height: 6000 }).k,
    ).toBe(0.5);
  });

  it("fits an empty box without dividing by zero", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    expect(
      computeFitTransform(visible, { x: 10, y: 10, width: 0, height: 0 }).k,
    ).toBe(2.4);
  });
});
