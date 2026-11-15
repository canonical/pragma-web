import {
  intersectsRect,
  LATTICE,
  measureRegionLabelWidth,
  REGION_LABEL_ROW,
  type Rect,
  requireAt,
} from "@canonical/prism-core";
import { LEGIBLE_MARGIN, MIN_FIT } from "./constants.js";
import frameLegibleWindow from "./frameLegibleWindow.js";
import type { ClassGraphLayout } from "./types.js";

/** How far a rectangle may overrun another and still count as inside it. */
const TOLERANCE = 1e-6;

/** Whether `inner` lies inside `outer`, edges included. */
function holdsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x - TOLERANCE &&
    inner.y >= outer.y - TOLERANCE &&
    inner.x + inner.w <= outer.x + outer.w + TOLERANCE &&
    inner.y + inner.h <= outer.y + outer.h + TOLERANCE
  );
}

/** Whether a window's edge runs through a box: it meets it, not wholly. */
function cutsRect(window: Rect, box: Rect): boolean {
  return intersectsRect(window, box) && !holdsRect(window, box);
}

/**
 * Find where the overview's first shelf ends: the bottom of the topmost
 * region, grown by every region that starts above it. Shelves are a gap
 * apart, so no region of the next shelf starts above that bottom.
 */
function findFirstShelfBottom(
  regions: ClassGraphLayout["regions"],
): number | undefined {
  const [first, ...rest] = [...regions].sort((a, b) => a.y - b.y);
  if (first === undefined) return undefined;
  let bottom = first.y + first.h;
  for (const region of rest) {
    if (region.y >= bottom) break;
    bottom = Math.max(bottom, region.y + region.h);
  }
  return bottom;
}

/**
 * Frame the window the overview opens on for a canvas of a given size, in
 * world units and in the canvas's aspect. With a class selected on
 * arrival, or a graph that fits the canvas at the legible zoom, it is the
 * legible window. Otherwise the boxes lead: the window runs from the
 * graph's top-left corner and shows the first shelf, its boxes and its
 * regions' labels, whole at the legible zoom or above. Where they cannot
 * all be whole so, it shows as many as fit, counted from the left, and
 * never a part of one; of the widths that show as many, the one whose
 * edges run through the fewest other boxes wins, then the widest. The
 * legible window stands whenever it already shows as many of the shelf's
 * boxes, none of them cut.
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
  const legible = frameLegibleWindow(layout, canvas, { arrival });
  const frame = layout.viewBox;
  const bottom = findFirstShelfBottom(layout.regions);
  if (
    arrival !== undefined ||
    bottom === undefined ||
    Math.min(canvas.w / frame.w, canvas.h / frame.h) >= MIN_FIT
  ) {
    return legible;
  }
  const boxes: Rect[] = [
    ...[...layout.nodes.values()].map(({ x, y, w, h }) => ({ x, y, w, h })),
    ...layout.regions.map((region) => ({
      x: region.x,
      y: region.y,
      w: measureRegionLabelWidth(region.prefix, region.ids.length),
      h: REGION_LABEL_ROW,
    })),
  ];
  const shelf = boxes.filter((box) => box.y < bottom);
  const others = boxes.filter((box) => box.y >= bottom);
  const aspect = canvas.h / canvas.w;
  const least = canvas.w / (MIN_FIT * LEGIBLE_MARGIN);
  // The widths at which the right edge falls half a lattice step past a
  // box or before one, in a gap, and the legible width itself.
  const windows = [
    ...new Set([
      least,
      ...boxes.flatMap((box) => [
        box.x + box.w + LATTICE / 2 - frame.x,
        box.x - LATTICE / 2 - frame.x,
      ]),
    ]),
  ]
    .filter((w) => w > 0 && w <= least)
    .map((w): Rect => ({ x: frame.x, y: frame.y, w, h: w * aspect }))
    .filter((window) => !shelf.some((box) => cutsRect(window, box)));
  const countHeld = (window: Rect): number =>
    shelf.filter((box) => holdsRect(window, box)).length;
  const countCut = (window: Rect): number =>
    others.filter((box) => cutsRect(window, box)).length;
  const most = Math.max(0, ...windows.map(countHeld));
  if (
    most === 0 ||
    (!shelf.some((box) => cutsRect(legible, box)) && countHeld(legible) >= most)
  ) {
    return legible;
  }
  return requireAt(
    windows
      .filter((window) => countHeld(window) === most)
      .sort((a, b) => countCut(a) - countCut(b) || b.w - a.w),
    0,
  );
}
