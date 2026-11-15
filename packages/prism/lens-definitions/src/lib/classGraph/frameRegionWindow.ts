import {
  intersectsRect,
  LATTICE,
  measureRegionLabelWidth,
  orderBy,
  REGION_LABEL_ROW,
  type Rect,
} from "@canonical/prism-core";
import {
  FIT_TOLERANCE,
  FRAME_ZOOM_MAX,
  LEGIBLE_MARGIN,
  MIN_FIT,
} from "./constants.js";
import containsRect from "./containsRect.js";
import type { ClassGraphLayout } from "./types.js";

/**
 * Frame the window a canvas shows when it fits one region: in the canvas's
 * own aspect, so the camera shows exactly it, holding the region's frame
 * whole, at the legible zoom or above, and with no edge cutting a class's
 * box or a region's label. An open region takes the least such window, so
 * it is drawn as large as it can be; a collapsed region, one box, takes
 * the widest, so its box is shown among its neighbours, not alone. Of the
 * windows of one size, a collapsed region's holds the most boxes; then
 * the one that centres the frame best wins, then the leftmost, then the
 * topmost.
 *
 * @param layout - The nodes in view, and the regions whose labels a window
 *   must not cut.
 * @param canvas - The canvas's size on screen, in px.
 * @param frame - The region's frame, its margin included.
 * @param options - Whether the region is drawn as one box (`wide`), and
 *   the least zoom the window shows at (`MIN_FIT` when omitted).
 * @returns The window, or undefined when the frame does not fit the canvas
 *   at that zoom or every window would cut a box.
 */
export default function frameRegionWindow(
  layout: Pick<ClassGraphLayout, "nodes" | "regions">,
  canvas: { readonly w: number; readonly h: number },
  frame: Rect,
  { wide = false, zoom = MIN_FIT }: { wide?: boolean; zoom?: number } = {},
): Rect | undefined {
  const obstacles: Rect[] = [
    ...[...layout.nodes.values()].map(({ x, y, w, h }) => ({ x, y, w, h })),
    ...layout.regions.map((region) => ({
      x: region.x,
      y: region.y,
      w: measureRegionLabelWidth(region.prefix, region.ids.length),
      h: REGION_LABEL_ROW,
    })),
  ];
  const aspect = canvas.h / canvas.w;
  const least = Math.max(frame.w, frame.h / aspect, canvas.w / FRAME_ZOOM_MAX);
  const most = canvas.w / (zoom * LEGIBLE_MARGIN);
  if (least > most) return undefined;
  const widths = [
    ...new Set([
      least,
      ...Array.from(
        { length: Math.floor((most - least) / LATTICE) },
        (_, step) => least + (step + 1) * LATTICE,
      ).filter((w) => w < most),
      most,
    ]),
  ];
  const isClean = (window: Rect): boolean =>
    obstacles.every(
      (box) => !intersectsRect(window, box) || containsRect(window, box),
    );
  // Where an edge may fall: the frame's own sides, centred on the frame,
  // or half a lattice step clear of a box, in the gap beside it; only
  // starts that keep the frame whole.
  const startsOf = (
    from: number,
    size: number,
    span: number,
    sides: readonly (readonly [number, number])[],
  ): number[] =>
    [
      ...new Set([
        from,
        from + size - span,
        from + size / 2 - span / 2,
        ...sides.flatMap(([start, length]) => [
          start + length + LATTICE / 2,
          start - LATTICE / 2 - span,
        ]),
      ]),
    ].filter(
      (start) =>
        start <= from + FIT_TOLERANCE &&
        start + span >= from + size - FIT_TOLERANCE,
    );
  const countHeld = (window: Rect): number =>
    obstacles.filter((box) => intersectsRect(window, box)).length;
  const offCentre = (window: Rect): number =>
    Math.abs(window.x + window.w / 2 - (frame.x + frame.w / 2)) +
    Math.abs(window.y + window.h / 2 - (frame.y + frame.h / 2));
  for (const w of wide ? widths.toReversed() : widths) {
    const h = w * aspect;
    const xs = startsOf(
      frame.x,
      frame.w,
      w,
      obstacles.map((box) => [box.x, box.w] as const),
    );
    const ys = startsOf(
      frame.y,
      frame.h,
      h,
      obstacles.map((box) => [box.y, box.h] as const),
    );
    const clean = xs
      .flatMap((x) => ys.map((y): Rect => ({ x, y, w, h })))
      .filter(isClean)
      .sort((a, b) =>
        orderBy(
          wide ? countHeld(b) - countHeld(a) : 0,
          offCentre(a) - offCentre(b),
          a.x - b.x,
          a.y - b.y,
        ),
      );
    const best = clean.at(0);
    if (best !== undefined) return best;
  }
  return undefined;
}
