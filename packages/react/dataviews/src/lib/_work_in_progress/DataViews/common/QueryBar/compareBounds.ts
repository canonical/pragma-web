import type { PredicateOperand } from "@canonical/dataviews-core";

/**
 * Order two range bounds: negative, zero or positive as the first stands
 * below, at or above the second, or null when they cannot be ordered — two
 * numbers compare as numbers and two calendar dates as their text, and any
 * other pair not at all. Pure.
 */
export default function compareBounds(
  a: PredicateOperand | undefined,
  b: PredicateOperand | undefined,
): number | null {
  if (typeof a === "number" && typeof b === "number") {
    return Math.sign(a - b);
  }
  if (typeof a === "string" && typeof b === "string") {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return null;
}
