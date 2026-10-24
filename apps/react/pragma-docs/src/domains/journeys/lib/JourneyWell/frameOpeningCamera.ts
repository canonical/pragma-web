import type { GraphBox, GraphTransform } from "@canonical/prism-core";
import frameLegibleWindow from "./frameLegibleWindow.js";

/**
 * Compute the camera the canvas opens on once the client has measured it:
 * the window `frameLegibleWindow` frames for the canvas's real size, flush
 * with the viewport's top-left corner, so a graph too large for the canvas
 * opens legible from its left edge, or around the selected job, instead of
 * whole below the legibility floor.
 *
 * @param bounds - The whole graph's box, its margin included.
 * @param selected - The selected hop's box, if any.
 * @param visible - The area of user space the viewport shows at the identity.
 * @param scale - The on-screen size of one user unit at the identity.
 * @returns The camera.
 */
export default function frameOpeningCamera(
  bounds: GraphBox,
  selected: GraphBox | undefined,
  visible: GraphBox,
  scale: number,
): GraphTransform {
  const canvas = {
    width: visible.width * scale,
    height: visible.height * scale,
  };
  const window = frameLegibleWindow(bounds, canvas, selected);
  const k =
    Math.min(canvas.width / window.width, canvas.height / window.height) /
    scale;
  return { k, x: visible.x - k * window.x, y: visible.y - k * window.y };
}
