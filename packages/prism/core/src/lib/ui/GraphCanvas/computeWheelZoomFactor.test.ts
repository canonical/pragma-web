import { describe, expect, it } from "vitest";
import computeWheelZoomFactor from "./computeWheelZoomFactor.js";

describe("computeWheelZoomFactor", () => {
  it("zooms in when the wheel scrolls up and out when it scrolls down", () => {
    expect(
      computeWheelZoomFactor({ deltaY: -500, deltaMode: 0, ctrlKey: false }),
    ).toBe(2);
    expect(
      computeWheelZoomFactor({ deltaY: 500, deltaMode: 0, ctrlKey: false }),
    ).toBe(0.5);
  });

  it("reads a delta in lines or pages at its own rate", () => {
    expect(
      computeWheelZoomFactor({ deltaY: -20, deltaMode: 1, ctrlKey: false }),
    ).toBe(2);
    expect(
      computeWheelZoomFactor({ deltaY: -1, deltaMode: 2, ctrlKey: false }),
    ).toBe(2);
  });

  it("reads a delta in a mode the DOM does not define as pixels", () => {
    expect(
      computeWheelZoomFactor({ deltaY: -500, deltaMode: 7, ctrlKey: false }),
    ).toBe(2);
  });

  it("zooms a pinch, a wheel with the control key held, ten times faster", () => {
    expect(
      computeWheelZoomFactor({ deltaY: -50, deltaMode: 0, ctrlKey: true }),
    ).toBe(2);
  });
});
