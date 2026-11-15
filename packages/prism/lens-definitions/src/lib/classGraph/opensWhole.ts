import containsRect from "./containsRect.js";
import type { ClassGraphLayout } from "./types.js";

/**
 * Whether a layout opens on its whole graph at the design canvas: its
 * opening view, at the legible zoom or above, holds every region, the
 * boxes and label rows within them. The view may leave out a strip of the
 * margin round the graph and still hold it whole.
 *
 * @param layout - The class graph's layout.
 * @returns Whether its opening view holds every region.
 */
export default function opensWhole(layout: ClassGraphLayout): boolean {
  return layout.regions.every((region) => containsRect(layout.view, region));
}
