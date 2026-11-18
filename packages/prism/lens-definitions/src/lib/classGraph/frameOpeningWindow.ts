import type { Rect } from "@canonical/prism-core";
import { LEGIBLE_MARGIN, MIN_FIT } from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
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
 * An opened view follows the same rule: its namespace is packed first, so
 * the map's top-left corner is that namespace's own.
 *
 * @param layout - The class graph's boxes, regions and viewBox.
 * @param canvas - The canvas's size, in screen pixels.
 * @param arrival - The box of the class selected on arrival, if any.
 * @returns The window.
 */
export default function frameOpeningWindow(
  layout: Pick<ClassGraphLayout, "nodes" | "regions" | "viewBox">,
  canvas: { readonly w: number; readonly h: number },
  arrival?: Rect,
): Rect {
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
