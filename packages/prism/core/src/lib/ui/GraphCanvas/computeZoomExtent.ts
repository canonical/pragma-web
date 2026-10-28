import { ZOOM_EXTENT } from "./constants.js";

/**
 * Compute the zoom extent that holds a camera's zoom, so the wheel, the
 * buttons and the keys zoom on from wherever an opening or a fit leaves
 * the camera: the floor lowered to a zoom below it; and the ceiling raised,
 * for a zoom above it, to that zoom times the zoom extent's widest, so the
 * camera keeps above it the room to zoom in it has above the identity. A
 * zoom inside the extent leaves it as it is.
 *
 * @param extent - The zoom extent's floor and ceiling now.
 * @param k - The camera's zoom.
 * @returns The floor and ceiling that hold the zoom.
 */
export default function computeZoomExtent(
  [floor, ceiling]: readonly [number, number],
  k: number,
): [number, number] {
  const [, widest] = ZOOM_EXTENT;
  return [Math.min(floor, k), k > ceiling ? k * widest : ceiling];
}
