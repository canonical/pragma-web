import type { Rect } from "@canonical/prism-core";
import { FIT_TOLERANCE } from "./constants.js";

/**
 * Whether `inner` lies inside `outer`, edges included, allowing either
 * `FIT_TOLERANCE` of overrun: a window's edges are fractional where it is
 * framed at the legible zoom.
 *
 * @param outer - The rectangle that should hold the other, such as a window.
 * @param inner - The rectangle it should hold, such as a box.
 * @returns Whether `outer` holds `inner`.
 */
export default function containsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x - FIT_TOLERANCE &&
    inner.y >= outer.y - FIT_TOLERANCE &&
    inner.x + inner.w <= outer.x + outer.w + FIT_TOLERANCE &&
    inner.y + inner.h <= outer.y + outer.h + FIT_TOLERANCE
  );
}
