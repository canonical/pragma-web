import type { Rect } from "@canonical/prism-core";
import { LEGIBLE_MARGIN, MIN_FIT, VIEW_MARGIN } from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import frameRegionWindow from "./frameRegionWindow.js";
import type { ClassGraphLayout } from "./types.js";

/**
 * Frame the window the overview opens on for a canvas of a given size, in
 * world units and in the canvas's aspect. With a class selected on
 * arrival it is the legible window around that class; with a graph that
 * fits the canvas at the legible zoom, the whole graph. Otherwise the map
 * opens at its top-left corner at the legible floor: the widest window a
 * reader can still read. The first shelf's boxes are whole in it where
 * they fit, and a box its edge crosses is cut there, the sign that the
 * map goes on.
 *
 * A drilled layout, with no class selected on arrival, opens on its
 * drilled namespace instead, not held to the whole graph's fit: its region
 * whole, in the least window of the canvas's aspect that cuts no box,
 * where it fits at the legible zoom; else from its region's top-left
 * corner at the legible floor.
 *
 * @param layout - The class graph's boxes, regions and viewBox, and the
 *   namespace it is drilled into, if any.
 * @param canvas - The canvas's size, in screen pixels.
 * @param arrival - The box of the class selected on arrival, if any.
 * @returns The window.
 */
export default function frameOpeningWindow(
  layout: Pick<ClassGraphLayout, "nodes" | "regions" | "viewBox" | "drilled">,
  canvas: { readonly w: number; readonly h: number },
  arrival?: Rect,
): Rect {
  const drilled =
    arrival === undefined
      ? layout.regions.find((region) => region.prefix === layout.drilled)
      : undefined;
  if (drilled !== undefined) {
    const within = {
      x: drilled.x - VIEW_MARGIN,
      y: drilled.y - VIEW_MARGIN,
      w: drilled.w + 2 * VIEW_MARGIN,
      h: drilled.h + 2 * VIEW_MARGIN,
    };
    return (
      frameRegionWindow(layout, canvas, within) ??
      frameLegibleWindow(layout, canvas, { within })
    );
  }
  const frame = layout.viewBox;
  if (
    arrival !== undefined ||
    Math.min(canvas.w / frame.w, canvas.h / frame.h) >= MIN_FIT
  ) {
    return frameLegibleWindow(layout, canvas, { arrival });
  }
  const w = canvas.w / (MIN_FIT * LEGIBLE_MARGIN);
  return { x: frame.x, y: frame.y, w, h: (w * canvas.h) / canvas.w };
}
