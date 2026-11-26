import type { PlacedConjunct } from "../../../types.js";

/**
 * Whether two readings of a field's conjuncts hold the same, in the same
 * places, so a quick filter renders again only when its own field moves.
 * Pure.
 *
 * @param a - One reading.
 * @param b - The other.
 * @returns Whether they say the same.
 */
export default function isSameConjuncts(
  a: readonly PlacedConjunct[],
  b: readonly PlacedConjunct[],
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
