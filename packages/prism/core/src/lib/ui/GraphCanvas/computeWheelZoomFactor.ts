import { PINCH_ZOOM_BOOST, WHEEL_ZOOM_RATES } from "./constants.js";

/**
 * Compute the factor a wheel event zooms the camera by: two to the power of
 * the vertical delta, negated so that scrolling up zooms in, at the rate of
 * the delta's mode, and faster for a trackpad's pinch, which the browser
 * reports as a wheel with the control key held. A mode the DOM does not
 * define reads as pixels.
 *
 * @param event - The wheel event's vertical delta, its mode and whether the
 *   control key is held.
 * @returns The factor to multiply the camera's scale by.
 */
export default function computeWheelZoomFactor({
  deltaY,
  deltaMode,
  ctrlKey,
}: Pick<WheelEvent, "deltaY" | "deltaMode" | "ctrlKey">): number {
  const [pixelRate] = WHEEL_ZOOM_RATES;
  const rate = WHEEL_ZOOM_RATES.at(deltaMode) ?? pixelRate;
  return 2 ** (-deltaY * rate * (ctrlKey ? PINCH_ZOOM_BOOST : 1));
}
