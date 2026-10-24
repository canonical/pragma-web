import type { GraphBox } from "@canonical/prism-core";
import { LEGIBLE_ZOOM } from "./constants.js";

/**
 * Frame the window of the graph a canvas of the given size opens on: the
 * whole graph when it fits there at the legible zoom or closer, else the
 * largest window that shows at the legible zoom, from the graph's left
 * edge, where the journeys start, and from its top, or centred on the
 * selected hop's row when there is one, kept inside the graph.
 *
 * @param bounds - The whole graph's box, its margin included.
 * @param canvas - The canvas's size, in px.
 * @param selected - The selected hop's box, if any.
 * @returns The window, in world units.
 */
export default function frameLegibleWindow(
  bounds: GraphBox,
  canvas: { readonly width: number; readonly height: number },
  selected: GraphBox | undefined,
): GraphBox {
  const fit = Math.min(
    canvas.width / bounds.width,
    canvas.height / bounds.height,
  );
  if (fit >= LEGIBLE_ZOOM) return bounds;
  const width = Math.min(bounds.width, canvas.width / LEGIBLE_ZOOM);
  const height = Math.min(bounds.height, canvas.height / LEGIBLE_ZOOM);
  const centre =
    selected === undefined
      ? bounds.y + height / 2
      : selected.y + selected.height / 2;
  const y = Math.min(
    Math.max(centre - height / 2, bounds.y),
    bounds.y + bounds.height - height,
  );
  return { x: bounds.x, y, width, height };
}
