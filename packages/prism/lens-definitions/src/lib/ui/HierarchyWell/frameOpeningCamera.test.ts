import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import { MIN_FIT } from "../../classGraph/constants.js";
import frameLegibleWindow from "../../classGraph/frameLegibleWindow.js";
import { requireEntry } from "../../classGraph/require.js";
import frameOpeningCamera from "./frameOpeningCamera.js";
import frameOpeningView from "./frameOpeningView.js";

const { layout, uris } = createClassGraphSetup();

/** What a viewport of a size shows of a viewBox at the identity. */
function measureIdentity(
  viewBox: { x: number; y: number; width: number; height: number },
  canvas: { w: number; h: number },
) {
  const scale = Math.min(canvas.w / viewBox.width, canvas.h / viewBox.height);
  return {
    scale,
    visible: {
      x: viewBox.x,
      y: viewBox.y,
      width: canvas.w / scale,
      height: canvas.h / scale,
    },
  };
}

describe("frameOpeningCamera", () => {
  it.each([
    { w: 590.67, h: 658 },
    { w: 632, h: 546 },
    { w: 504, h: 570 },
  ])(
    "opens a $w by $h canvas on its own legible window, flush top-left",
    (canvas) => {
      const viewBox = frameOpeningView(layout, undefined);
      const { scale, visible } = measureIdentity(viewBox, canvas);
      const camera = frameOpeningCamera(layout, undefined, visible, scale);
      const window = frameLegibleWindow(layout, canvas);
      expect(scale * camera.k).toBeGreaterThanOrEqual(MIN_FIT);
      expect(scale * camera.k).toBeCloseTo(canvas.w / window.w, 10);
      expect(camera.x + camera.k * window.x).toBeCloseTo(visible.x, 10);
      expect(camera.y + camera.k * window.y).toBeCloseTo(visible.y, 10);
    },
  );

  it("keeps the server's window, at the identity, on the design canvas", () => {
    const canvas = { w: 590, h: 778 };
    const viewBox = frameOpeningView(layout, undefined);
    const { scale, visible } = measureIdentity(viewBox, canvas);
    const camera = frameOpeningCamera(layout, undefined, visible, scale);
    expect(camera.k).toBeCloseTo(1, 10);
    expect(camera.x).toBeCloseTo(0, 6);
    expect(camera.y).toBeCloseTo(0, 6);
  });

  it("opens on the class selected on arrival", () => {
    const canvas = { w: 504, h: 570 };
    const arrival = requireEntry(
      layout.nodes,
      requireEntry(uris, "anatomy:Node"),
    );
    const viewBox = frameOpeningView(layout, arrival);
    const { scale, visible } = measureIdentity(viewBox, canvas);
    const camera = frameOpeningCamera(layout, arrival, visible, scale);
    const left = camera.x + camera.k * arrival.x;
    const top = camera.y + camera.k * arrival.y;
    expect(left).toBeGreaterThanOrEqual(visible.x);
    expect(top).toBeGreaterThanOrEqual(visible.y);
    expect(left + camera.k * arrival.w).toBeLessThanOrEqual(
      visible.x + visible.width,
    );
    expect(top + camera.k * arrival.h).toBeLessThanOrEqual(
      visible.y + visible.height,
    );
  });
});
