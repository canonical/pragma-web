import type { RelaxOptions, WellBox } from "./types.js";

/**
 * The bounded relaxation pass — a static collision guarantee: every
 * unordered pair of overlapping boxes (plus gap) pushes apart along the
 * axis of least overlap, half each; pinned boxes never move (their partner
 * takes the full shift). Pair order and iteration count are fixed, so the
 * pass is deterministic. Ties push horizontally: labels are wide, rows are
 * shallow.
 *
 * @param boxes - The boxes to separate; moved in place.
 * @param options - The gap, the pass budget and the pinned indexes.
 * @note Impure: mutates the `x` and `y` of the boxes it is given.
 */
export const relaxBoxes = (
  boxes: WellBox[],
  { gap, iterations, pinned }: RelaxOptions,
): void => {
  const isPinned = (index: number): boolean => pinned?.has(index) === true;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let moved = false;
    for (const [a, boxA] of boxes.entries()) {
      for (const [offset, boxB] of boxes.slice(a + 1).entries()) {
        const b = a + 1 + offset;
        if (isPinned(a) && isPinned(b)) continue;
        const overlapX =
          (boxA.width + boxB.width) / 2 + gap - Math.abs(boxA.x - boxB.x);
        const overlapY =
          (boxA.height + boxB.height) / 2 + gap - Math.abs(boxA.y - boxB.y);
        if (overlapX <= 0 || overlapY <= 0) continue;
        moved = true;
        const axis = overlapX <= overlapY ? "x" : "y";
        const overlap = axis === "x" ? overlapX : overlapY;
        const sign = (axis === "x" ? boxA.x <= boxB.x : boxA.y <= boxB.y)
          ? -1
          : 1;
        const shiftA = isPinned(a) ? 0 : isPinned(b) ? overlap : overlap / 2;
        const shiftB = isPinned(b) ? 0 : isPinned(a) ? overlap : overlap / 2;
        if (axis === "x") {
          boxA.x += sign * shiftA;
          boxB.x -= sign * shiftB;
        } else {
          boxA.y += sign * shiftA;
          boxB.y -= sign * shiftB;
        }
      }
    }
    if (!moved) break;
  }
};
