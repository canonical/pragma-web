import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import { MIN_FIT } from "../../classGraph/constants.js";
import frameRefitWindow from "./frameRefitWindow.js";

const { layout } = createClassGraphSetup();

/** The overview's floor a Fit stops at: 16px labels render at 12px. */
const OVERVIEW_FLOOR = 12 / 16;

describe("frameRefitWindow", () => {
  it("frames a box too large for the legible zoom from its corner, legibly", () => {
    const box = { x: -16, y: -16, width: 752, height: 544 };
    const visible = { x: -16, y: -16, width: 590.67, height: 778 };
    const window = frameRefitWindow(
      layout,
      new Set(),
      box,
      visible,
      1,
      MIN_FIT,
    );
    expect(window).toMatchObject({ x: box.x, y: box.y });
    expect(visible.width / window.width).toBeGreaterThanOrEqual(MIN_FIT);
    expect(window.height / window.width).toBeCloseTo(
      visible.height / visible.width,
      10,
    );
  });

  it("frames at the floor it is given, cutting no class on the left, top or right", () => {
    // A Fit stops at the overview's floor: the window is wider than the
    // legible one, and its edges still fall in the gaps between boxes.
    const box = { x: -16, y: -16, width: 1600, height: 1200 };
    const visible = { x: -16, y: -16, width: 590.67, height: 778 };
    const window = frameRefitWindow(
      layout,
      new Set(),
      box,
      visible,
      1,
      OVERVIEW_FLOOR,
    );
    expect(window).toMatchObject({ x: box.x, y: box.y });
    expect(visible.width / window.width).toBeGreaterThanOrEqual(OVERVIEW_FLOOR);
    expect(visible.width / window.width).toBeLessThan(MIN_FIT);
    const right = window.x + window.width;
    for (const node of layout.nodes.values()) {
      const crossesRight = node.x < right && node.x + node.w > right;
      const below = node.y >= window.y + window.height;
      expect(crossesRight && !below, node.uri).toBe(false);
    }
  });

  it("lets no hidden class stand in the window's way", () => {
    const box = { x: -16, y: -16, width: 752, height: 544 };
    const visible = { x: -16, y: -16, width: 590.67, height: 778 };
    const every = new Set(layout.nodes.keys());
    const window = frameRefitWindow(layout, every, box, visible, 1, MIN_FIT);
    // With every class hidden only the region labels remain, so the window
    // is the widest legible one.
    expect(visible.width / window.width).toBeCloseTo(MIN_FIT, 4);
  });
});
