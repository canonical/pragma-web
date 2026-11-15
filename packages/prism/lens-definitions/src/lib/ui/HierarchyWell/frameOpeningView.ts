import type { GraphBox, Rect } from "@canonical/prism-core";
import { DESIGN_CANVAS } from "../../classGraph/constants.js";
import frameOpeningWindow from "../../classGraph/frameOpeningWindow.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";

/**
 * Frame the box the canvas opens on, as the server paints it for the
 * design canvas: the whole graph when it fits there at a legible zoom,
 * else a legible window of it, centred on the class selected on arrival
 * when there is one, so a term page opens on its term, and otherwise
 * showing the first shelf's boxes from the left, none of them cut.
 *
 * @param layout - The class graph's layout.
 * @param selected - The box of the class selected on arrival, if any.
 * @returns The canvas's viewBox.
 */
export default function frameOpeningView(
  layout: ClassGraphLayout,
  selected: Rect | undefined,
): GraphBox {
  const { x, y, w, h } = frameOpeningWindow(layout, DESIGN_CANVAS, selected);
  return { x, y, width: w, height: h };
}
