import computeFitTransform from "./computeFitTransform.js";
import { HUBS_SCALE, LEGIBLE_NUDGE } from "./constants.js";
import type { GraphBox, GraphLegibleWindow, GraphTransform } from "./types.js";

/**
 * Compute the camera a canvas opens on when its owner chooses none, once
 * the client has measured the viewport: the identity, the server's paint,
 * when the viewBox shows there at the legible zoom (every 14px text at
 * 12px or more on screen); else, as on a phone, a legible window of the
 * graph's first region, the rest a pan away: the window `legibleWindow`
 * chooses of the viewBox, fitted no lower than the legible zoom, or,
 * without one, the viewBox from its top-left corner at that zoom.
 *
 * @param viewBox - The viewport's viewBox, which the server paints.
 * @param visible - The area of user space the viewport shows at the identity.
 * @param scale - The on-screen size of one user unit at the identity.
 * @param legibleWindow - The canvas owner's choice of a legible window, if any.
 * @returns The camera, or `undefined` to keep the identity.
 */
export default function computeOpeningTransform(
  viewBox: GraphBox,
  visible: GraphBox,
  scale: number,
  legibleWindow: GraphLegibleWindow | undefined,
): GraphTransform | undefined {
  if (scale >= HUBS_SCALE) return undefined;
  const shown =
    legibleWindow === undefined
      ? viewBox
      : legibleWindow(viewBox, visible, scale);
  return computeFitTransform(
    visible,
    shown,
    (HUBS_SCALE * LEGIBLE_NUDGE) / scale,
  );
}
