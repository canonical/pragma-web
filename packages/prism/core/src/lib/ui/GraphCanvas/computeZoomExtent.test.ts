import { describe, expect, it } from "vitest";
import computeZoomExtent from "./computeZoomExtent.js";
import { ZOOM_EXTENT } from "./constants.js";

describe("computeZoomExtent", () => {
  it("leaves the extent as it is for a zoom inside it", () => {
    expect(computeZoomExtent(ZOOM_EXTENT, 1)).toEqual([...ZOOM_EXTENT]);
    expect(computeZoomExtent(ZOOM_EXTENT, ZOOM_EXTENT[1])).toEqual([
      ...ZOOM_EXTENT,
    ]);
  });

  it("lowers the floor to a zoom below it", () => {
    expect(computeZoomExtent(ZOOM_EXTENT, 0.25)).toEqual([0.25, 2.4]);
  });

  it("raises the ceiling above a zoom above it by the extent's widest", () => {
    const [floor, ceiling] = computeZoomExtent(ZOOM_EXTENT, 3);
    expect(floor).toBe(0.5);
    expect(ceiling).toBeCloseTo(7.2, 9);
  });
});
