import { ZOOM_EXTENT } from "./constants.js";
import type { GraphBox, GraphTransform } from "./types.js";

/**
 * Compute the camera that fits a world box into the visible part of the
 * viewport, flush with its top-left corner as the first paint sits, at the
 * largest zoom the zoom extent allows. Fitting the viewBox itself into a
 * viewport that shows exactly the viewBox gives the identity.
 *
 * @param visible - The viewport's visible area, in its user units.
 * @param box - The world box to fit.
 * @returns The camera's scale and translation.
 */
export default function computeFitTransform(
  visible: GraphBox,
  box: GraphBox,
): GraphTransform {
  const [minZoom, maxZoom] = ZOOM_EXTENT;
  const fitted = Math.min(
    visible.width / Math.max(box.width, 1),
    visible.height / Math.max(box.height, 1),
  );
  const k = Math.min(maxZoom, Math.max(minZoom, fitted));
  return { k, x: visible.x - k * box.x, y: visible.y - k * box.y };
}
