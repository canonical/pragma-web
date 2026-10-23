import {
  CLEAN_EDGE_ZOOM,
  LATTICE,
  LEGIBLE_MARGIN,
  MIN_FIT,
  REGION_LABEL_ROW,
  VIEW_MARGIN,
} from "./constants.js";
import { intersectsRect, measureRegionLabelWidth } from "./geometry.js";
import type { ClassGraphLayout, LegibleWindowOptions, Rect } from "./types.js";

/** How far a rectangle may overrun another and still count as inside it. */
const TOLERANCE = 1e-6;

/** Whether `inner` lies inside `outer`, edges included. */
function containsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x - TOLERANCE &&
    inner.y >= outer.y - TOLERANCE &&
    inner.x + inner.w <= outer.x + outer.w + TOLERANCE &&
    inner.y + inner.h <= outer.y + outer.h + TOLERANCE
  );
}

/**
 * Frame the window of the class graph a canvas of a given size opens on,
 * or refits to, in world units and in the canvas's own aspect: the box it
 * frames when that fits there at the legible zoom, so every 14px label
 * renders at 12px or more; else a window at the legible zoom or the least
 * zoom above it whose left, top and right edges cut through no class's box
 * and no region's label, and whose bottom edge crosses only boxes that
 * continue below within its width, the sign that more of the graph lies
 * there; a box in the bottom-right corner is never cut on two sides. When
 * one more zoom step also keeps the bottom edge clear of every box, the
 * window takes it.
 *
 * The box it frames is the whole viewBox, or the one `within` names, such as
 * the classes a filter leaves or a region a reader picked, and runs from
 * its top-left corner, or, for a class selected on arrival, from the
 * corner in the gaps before the boxes that gives the widest such window
 * holding the class, the one that centres it best among equals, so a term
 * page opens on its term. When no zoom frames it so, the window is the
 * legible one, from the top-left corner or centred on the class.
 *
 * @param layout - The class graph's boxes, regions and viewBox; only the
 *   boxes drawn, when a filter hides some.
 * @param canvas - The canvas's size, in screen pixels.
 * @param options - The box of the class selected on arrival, if any, and
 *   the box to frame, the whole viewBox when omitted.
 * @returns The window.
 */
export default function frameLegibleWindow(
  layout: Pick<ClassGraphLayout, "nodes" | "regions" | "viewBox">,
  canvas: { readonly w: number; readonly h: number },
  { arrival, within: frame = layout.viewBox }: LegibleWindowOptions = {},
): Rect {
  if (Math.min(canvas.w / frame.w, canvas.h / frame.h) >= MIN_FIT) {
    return frame;
  }
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
  const least = {
    w: canvas.w / (MIN_FIT * LEGIBLE_MARGIN),
    h: canvas.h / (MIN_FIT * LEGIBLE_MARGIN),
  };
  const isFramed = (window: Rect): boolean =>
    obstacles.some((box) => containsRect(window, box)) &&
    (arrival === undefined || containsRect(window, arrival));
  // A box the bottom edge crosses shows that more lies below, as long as
  // it lies within the window's width; every other box in view lies wholly
  // in the window, so no corner cuts a box on two sides.
  const isOpenBelow = (window: Rect): boolean =>
    obstacles.every(
      (box) =>
        !intersectsRect(window, box) ||
        containsRect(window, box) ||
        (box.x >= window.x - TOLERANCE &&
          box.x + box.w <= window.x + window.w + TOLERANCE &&
          box.y >= window.y - TOLERANCE &&
          box.y + box.h > window.y + window.h),
    );
  const isClean = (window: Rect): boolean =>
    obstacles.every(
      (box) => !intersectsRect(window, box) || containsRect(window, box),
    );

  // The window from a top-left corner: the legible width, then the widths
  // at which the right edge falls half a lattice step past a box's right
  // side, in the gap after it, or the bottom edge on or half a step past a
  // box's bottom, or half a step above a box's top, in the gap before it,
  // from the widest down.
  const searchFrom = (x: number, y: number): Rect | undefined => {
    const windows = [
      ...new Set([
        least.w,
        ...obstacles.flatMap((box) => [
          box.x + box.w + LATTICE / 2 - x,
          (box.y + box.h - y) / aspect,
          (box.y + box.h + LATTICE / 2 - y) / aspect,
          (box.y - LATTICE / 2 - y) / aspect,
        ]),
      ]),
    ]
      .filter((w) => w > 0 && w <= least.w)
      .sort((a, b) => b - a)
      .map((w): Rect => ({ x, y, w, h: w * aspect }))
      .filter(isFramed);
    const open = windows.find(isOpenBelow);
    if (open === undefined) return undefined;
    return (
      windows.find(
        (window) =>
          window.w <= open.w &&
          window.w * CLEAN_EDGE_ZOOM >= open.w &&
          isClean(window),
      ) ?? open
    );
  };

  if (arrival === undefined) {
    return (
      searchFrom(frame.x, frame.y) ?? {
        x: frame.x,
        y: frame.y,
        w: least.w,
        h: least.w * aspect,
      }
    );
  }
  // Around an arrival, every corner in a gap a view margin before a box,
  // or the graph's own, from which a legible window could hold the class
  // is tried; the widest window wins, then the one that centres the class
  // best.
  const corners = (
    starts: readonly number[],
    from: number,
    near: number,
    far: number,
    span: number,
  ): number[] =>
    [...new Set([from, ...starts.map((start) => start - VIEW_MARGIN)])].filter(
      (start) => start >= from && start <= near && start + span >= far,
    );
  const xs = corners(
    obstacles.map((box) => box.x),
    frame.x,
    arrival.x,
    arrival.x + arrival.w,
    least.w,
  );
  const ys = corners(
    obstacles.map((box) => box.y),
    frame.y,
    arrival.y,
    arrival.y + arrival.h,
    least.h,
  );
  const offCentre = (window: Rect): number =>
    Math.abs(window.x + window.w / 2 - (arrival.x + arrival.w / 2)) +
    Math.abs(window.y + window.h / 2 - (arrival.y + arrival.h / 2));
  let best: Rect | undefined;
  for (const x of xs) {
    for (const y of ys) {
      const found = searchFrom(x, y);
      if (
        found !== undefined &&
        (best === undefined ||
          found.w > best.w + TOLERANCE ||
          (found.w > best.w - TOLERANCE && offCentre(found) < offCentre(best)))
      ) {
        best = found;
      }
    }
  }
  if (best !== undefined) return best;
  const centre = (
    from: number,
    size: number,
    span: number,
    start: number,
    room: number,
  ): number =>
    Math.min(Math.max(from + size / 2 - span / 2, start), start + room - span);
  return {
    x: centre(arrival.x, arrival.w, least.w, frame.x, frame.w),
    y: centre(arrival.y, arrival.h, least.h, frame.y, frame.h),
    w: least.w,
    h: least.w * aspect,
  };
}
