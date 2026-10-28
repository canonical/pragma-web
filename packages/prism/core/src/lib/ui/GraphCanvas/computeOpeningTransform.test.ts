import { describe, expect, it } from "vitest";
import computeOpeningTransform from "./computeOpeningTransform.js";
import { HUBS_SCALE, LEGIBLE_NUDGE } from "./constants.js";

const VIEW_BOX = { x: -16, y: -16, width: 976, height: 736 };

describe("computeOpeningTransform", () => {
  it("keeps the identity when the viewBox shows at the legible zoom", () => {
    expect(
      computeOpeningTransform(VIEW_BOX, VIEW_BOX, HUBS_SCALE, undefined),
    ).toBeUndefined();
  });

  it("opens below the legible zoom on the viewBox's top-left corner at it", () => {
    const scale = 0.4;
    const visible = { x: -16, y: -16, width: 975, height: 1500 };
    const { k, x, y } = computeOpeningTransform(
      VIEW_BOX,
      visible,
      scale,
      undefined,
    ) ?? { k: 0, x: 0, y: 0 };
    expect(k * scale).toBeCloseTo(HUBS_SCALE * LEGIBLE_NUDGE, 9);
    expect(VIEW_BOX.x * k + x).toBeCloseTo(visible.x, 9);
    expect(VIEW_BOX.y * k + y).toBeCloseTo(visible.y, 9);
  });

  it("opens below the legible zoom on the window `legibleWindow` chooses, at no lower a zoom", () => {
    const scale = 0.4;
    const visible = { x: -16, y: -16, width: 975, height: 1500 };
    const window = { x: 320, y: 160, width: 512, height: 768 };
    const opened = computeOpeningTransform(
      VIEW_BOX,
      visible,
      scale,
      () => window,
    );
    expect(opened).toEqual({
      k: (HUBS_SCALE * LEGIBLE_NUDGE) / scale,
      x: visible.x - ((HUBS_SCALE * LEGIBLE_NUDGE) / scale) * window.x,
      y: visible.y - ((HUBS_SCALE * LEGIBLE_NUDGE) / scale) * window.y,
    });
  });
});
