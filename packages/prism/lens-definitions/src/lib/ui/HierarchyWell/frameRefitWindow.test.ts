import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import { MIN_FIT } from "../../classGraph/constants.js";
import frameRefitWindow from "./frameRefitWindow.js";

const { layout } = createClassGraphSetup();

describe("frameRefitWindow", () => {
  it("frames a box too large for the legible zoom from its corner, legibly", () => {
    const box = { x: -16, y: -16, width: 752, height: 544 };
    const visible = { x: -16, y: -16, width: 590.67, height: 778 };
    const window = frameRefitWindow(layout, new Set(), box, visible, 1);
    expect(window).toMatchObject({ x: box.x, y: box.y });
    expect(visible.width / window.width).toBeGreaterThanOrEqual(MIN_FIT);
    expect(window.height / window.width).toBeCloseTo(
      visible.height / visible.width,
      10,
    );
  });

  it("lets no hidden class stand in the window's way", () => {
    const box = { x: -16, y: -16, width: 752, height: 544 };
    const visible = { x: -16, y: -16, width: 590.67, height: 778 };
    const every = new Set(layout.nodes.keys());
    const window = frameRefitWindow(layout, every, box, visible, 1);
    // With every class hidden only the region labels remain, so the window
    // is the widest legible one.
    expect(visible.width / window.width).toBeCloseTo(MIN_FIT, 4);
  });
});
