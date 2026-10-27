import { DESIGN_CANVAS, SHELF_GAP, VIEW_MARGIN } from "./constants.js";
import { requireAt, requireDefined } from "./require.js";
import type { ShelfPacking } from "./types.js";

/** The least stacked height of a prefix of the regions, and how it ends. */
interface ShelfStack {
  /** The shelves' heights and the gaps between them, in px. */
  readonly h: number;
  /** Where its last shelf starts, by index into the sizes. */
  readonly start: number;
}

/**
 * Pack regions, largest first, into shelves 48px apart in both directions,
 * keeping the shelf break of their order that fits the design canvas at
 * the largest zoom (on a tie, fewer shelves).
 *
 * Every packing's width is one run's width, so each run's width is tried
 * as a bound: under a bound, the least stacked height on each number of
 * shelves comes from a dynamic programme over where the last shelf starts.
 * That is polynomial in the number of regions, where trying every break
 * would double with each.
 *
 * @param sizes - Each region's width and height, in their packing order.
 * @returns The best packing.
 * @throws When there is no region to pack.
 */
export default function packShelves(
  sizes: readonly { readonly w: number; readonly h: number }[],
): ShelfPacking {
  if (sizes.length === 0)
    throw new Error("the class graph has no region to pack");
  const count = sizes.length;
  // Each run's width and height, by its first and its last index.
  const runs = sizes.map((_, from) => {
    let w = -SHELF_GAP;
    let h = 0;
    return sizes.slice(from).map((size) => {
      w += size.w + SHELF_GAP;
      h = Math.max(h, size.h);
      return { w, h };
    });
  });
  const runOf = (from: number, to: number) =>
    requireAt(requireAt(runs, from), to - from);
  const bounds = [
    ...new Set(runs.flatMap((byEnd) => byEnd.map((run) => run.w))),
  ].sort((a, b) => a - b);

  let best: ShelfPacking | undefined;
  for (const bound of bounds) {
    // A packing narrower than the bound was found under its own width, so
    // past the bound whose width alone caps the fit below the best, none
    // can do better.
    if (
      best !== undefined &&
      DESIGN_CANVAS.w / (bound + 2 * VIEW_MARGIN) < best.fit - 1e-12
    ) {
      break;
    }
    // The least height of the first `end` regions on exactly `shelves`
    // shelves under the bound: stacks[shelves][end].
    const stacks: (ShelfStack | undefined)[][] = [
      [{ h: -SHELF_GAP, start: 0 }],
    ];
    for (let shelves = 1; shelves <= count; shelves += 1) {
      const row: (ShelfStack | undefined)[] = [undefined];
      for (let end = 1; end <= count; end += 1) {
        let least: ShelfStack | undefined;
        for (let start = end - 1; start >= 0; start -= 1) {
          const run = runOf(start, end - 1);
          if (run.w > bound) break;
          const before = requireAt(stacks, shelves - 1).at(start);
          if (before === undefined) continue;
          const h = before.h + SHELF_GAP + run.h;
          if (least === undefined || h < least.h) least = { h, start };
        }
        row.push(least);
      }
      stacks.push(row);
    }
    for (let shelfCount = 1; shelfCount <= count; shelfCount += 1) {
      const last = requireAt(stacks, shelfCount).at(count);
      if (last === undefined) continue;
      const shelves: number[][] = [];
      for (let end = count, level = shelfCount; end > 0; level -= 1) {
        const { start } = requireDefined(
          requireAt(stacks, level).at(end),
          "shelf stack",
        );
        shelves.unshift(
          Array.from({ length: end - start }, (_, offset) => start + offset),
        );
        end = start;
      }
      const w = Math.max(
        ...shelves.map(
          (shelf) => runOf(requireAt(shelf, 0), requireAt(shelf, -1)).w,
        ),
      );
      const fit = Math.min(
        DESIGN_CANVAS.w / (w + 2 * VIEW_MARGIN),
        DESIGN_CANVAS.h / (last.h + 2 * VIEW_MARGIN),
      );
      if (
        best === undefined ||
        fit > best.fit + 1e-12 ||
        (fit > best.fit - 1e-12 && shelves.length < best.shelves.length)
      ) {
        best = { shelves, w, h: last.h, fit };
      }
    }
  }
  // The widest bound, every region on one shelf, always packs.
  return requireDefined(best, "shelf packing");
}
