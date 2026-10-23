import { DESIGN_CANVAS, SHELF_GAP, VIEW_MARGIN } from "./constants.js";
import { orderBy } from "./geometry.js";
import { requireAt } from "./require.js";
import type { ShelfPacking } from "./types.js";

/** Count the set bits of a mask: the shelf breaks it makes. */
function countBits(mask: number): number {
  return mask.toString(2).replaceAll("0", "").length;
}

/**
 * Pack regions, largest first, into shelves 48px apart in both directions,
 * trying every shelf break of their order and keeping the one that fits
 * the design canvas at the largest zoom (on a tie, fewer shelves).
 *
 * @param sizes - Each region's width and height, in their packing order.
 * @returns The best packing.
 */
export default function packShelves(
  sizes: readonly { readonly w: number; readonly h: number }[],
): ShelfPacking {
  if (sizes.length === 0)
    throw new Error("the class graph has no region to pack");
  // Break the order into shelves where the mask's bits are set.
  const packAt = (mask: number): ShelfPacking => {
    const shelves: number[][] = [[0]];
    for (let index = 1; index < sizes.length; index += 1) {
      if (mask & (2 ** (index - 1))) shelves.push([index]);
      else requireAt(shelves, -1).push(index);
    }
    const w = Math.max(
      ...shelves.map(
        (shelf) =>
          shelf.reduce((sum, index) => sum + requireAt(sizes, index).w, 0) +
          SHELF_GAP * (shelf.length - 1),
      ),
    );
    const h =
      shelves.reduce(
        (sum, shelf) =>
          sum + Math.max(...shelf.map((index) => requireAt(sizes, index).h)),
        0,
      ) +
      SHELF_GAP * (shelves.length - 1);
    const fit = Math.min(
      DESIGN_CANVAS.w / (w + 2 * VIEW_MARGIN),
      DESIGN_CANVAS.h / (h + 2 * VIEW_MARGIN),
    );
    return { shelves, w, h, fit };
  };
  // Fewer shelves first, so a tie in fit keeps the packing with fewer.
  const masks = Array.from(
    { length: 2 ** (sizes.length - 1) },
    (_, mask) => mask,
  ).sort((a, b) => orderBy(countBits(a) - countBits(b), a - b));
  let best = packAt(0);
  for (const mask of masks.slice(1)) {
    const candidate = packAt(mask);
    if (candidate.fit > best.fit + 1e-12) best = candidate;
  }
  return best;
}
