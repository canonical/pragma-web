import type { GraphBox } from "@canonical/prism-core";
import { DESIGN_CANVAS } from "../../classGraph/constants.js";
import frameLegibleWindow from "../../classGraph/frameLegibleWindow.js";
import type { ClassGraphLayout, Rect } from "../../classGraph/types.js";

/**
 * Frame the box the canvas opens on, as the server paints it for the
 * design canvas: the whole graph when it fits there at a legible zoom,
 * else a legible window of it whose edges cut through no box, centred on
 * the class selected on arrival when there is one, so a term page opens
 * on its term.
 *
 * @param layout - The class graph's layout.
 * @param selected - The box of the class selected on arrival, if any.
 * @returns The canvas's viewBox.
 */
export default function frameOpeningView(
  layout: ClassGraphLayout,
  selected: Rect | undefined,
): GraphBox {
  const { x, y, w, h } = frameLegibleWindow(layout, DESIGN_CANVAS, {
    arrival: selected,
  });
  return { x, y, width: w, height: h };
}
