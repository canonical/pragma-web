import type { GraphBox, GraphTransform } from "@canonical/prism-core";
import frameLegibleWindow from "../../classGraph/frameLegibleWindow.js";
import type { ClassGraphLayout, Rect } from "../../classGraph/types.js";

/**
 * Compute the camera the canvas opens on once the client has measured it:
 * the window the canvas's real size calls for (the whole graph when it
 * fits there at a legible zoom, else a legible window whose edges cut
 * through no box, around the class selected on arrival), flush with the
 * viewport's top-left corner. A canvas the size of the design canvas finds
 * the server's own window, at or next to the identity.
 *
 * @param layout - The class graph's layout.
 * @param selected - The box of the class selected on arrival, if any.
 * @param visible - The area of user space the viewport shows at the identity.
 * @param scale - The on-screen size of one user unit at the identity.
 * @returns The camera.
 */
export default function frameOpeningCamera(
  layout: ClassGraphLayout,
  selected: Rect | undefined,
  visible: GraphBox,
  scale: number,
): GraphTransform {
  const canvas = { w: visible.width * scale, h: visible.height * scale };
  const window = frameLegibleWindow(layout, canvas, { arrival: selected });
  const k = Math.min(canvas.w / window.w, canvas.h / window.h) / scale;
  return { k, x: visible.x - k * window.x, y: visible.y - k * window.y };
}
