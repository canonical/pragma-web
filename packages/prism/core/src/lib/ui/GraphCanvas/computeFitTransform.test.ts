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

  it("zooms in no further than the zoom extent's widest", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    expect(
      computeFitTransform(visible, { x: 0, y: 0, width: 16, height: 16 }).k,
    ).toBe(2.4);
  });

  it("fits a box more than twice the visible area whole, below the extent's floor", () => {
    const visible = { x: -16, y: -16, width: 688, height: 907 };
    const graph = { x: -16, y: -16, width: 1768, height: 2216 };
    const { k, x, y } = computeFitTransform(visible, graph);
    expect(k).toBeCloseTo(688 / 1768, 10);
    expect(k).toBeLessThan(0.5);
    expect(graph.width * k).toBeCloseTo(visible.width, 10);
    expect(graph.height * k).toBeLessThanOrEqual(visible.height);
    expect([x + k * graph.x, y + k * graph.y]).toEqual([-16, -16]);
  });

  it("shows a box too large for the least zoom from its top-left corner at it", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    const box = { x: 100, y: 50, width: 1600, height: 1200 };
    expect(computeFitTransform(visible, box, 0.8)).toEqual({
      k: 0.8,
      x: -80,
      y: -40,
    });
    expect(computeFitTransform(visible, box, 0.25).k).toBe(0.5);
  });

  it("fits an empty box without dividing by zero", () => {
    const visible = { x: 0, y: 0, width: 800, height: 600 };
    expect(
      computeFitTransform(visible, { x: 10, y: 10, width: 0, height: 0 }).k,
    ).toBe(2.4);
  });
});
