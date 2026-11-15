import { FIT_TOLERANCE } from "./constants.js";
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
  const { view } = layout;
  return layout.regions.every(
    (region) =>
      region.x >= view.x - FIT_TOLERANCE &&
      region.y >= view.y - FIT_TOLERANCE &&
      region.x + region.w <= view.x + view.w + FIT_TOLERANCE &&
      region.y + region.h <= view.y + view.h + FIT_TOLERANCE,
  );
}
