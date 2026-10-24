import { ZOOM_EXTENT } from "./constants.js";
import type { GraphBox, GraphTransform } from "./types.js";

/**
 * Compute the camera that fits a world box into the visible part of the
 * viewport, flush with its top-left corner as the first paint sits, at
 * most at the zoom extent's widest. The wheel's floor is no narrowest: a
 * box of any size fits, however far below it that takes the zoom, unless
 * a least zoom stops it. Fitting the viewBox itself
 * into a viewport that shows exactly the viewBox gives the identity.
 *
 * A least zoom keeps a fit from zooming out past it: a box too large to
 * fit at that zoom is shown from its top-left corner at it instead.
 *
 * @param visible - The viewport's visible area, in its user units.
 * @param box - The world box to fit.
 * @param least - The smallest zoom the fit may take; none when omitted.
 * @returns The camera's scale and translation.
 */
export default function computeFitTransform(
  visible: GraphBox,
  box: GraphBox,
  least = 0,
): GraphTransform {
  const [, maxZoom] = ZOOM_EXTENT;
  const fitted = Math.min(
    visible.width / Math.max(box.width, 1),
    visible.height / Math.max(box.height, 1),
  );
  const k = Math.max(least, Math.min(maxZoom, fitted));
  return { k, x: visible.x - k * box.x, y: visible.y - k * box.y };
}
