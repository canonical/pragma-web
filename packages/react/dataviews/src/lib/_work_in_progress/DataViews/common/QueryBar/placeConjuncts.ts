import type { Slice } from "@canonical/dataviews-core";
import { canonicalizeSlice } from "@canonical/dataviews-core/bindings";
import type { PlacedConjunct } from "./types.js";

/**
 * Each conjunct of a slice with its place: in canonical order, each
 * numbered among those at its address from 0, as the query commands count
 * a conjunct's `nth`. The one numbering every clause reader names
 * conjuncts by. Pure.
 */
export default function placeConjuncts(
  slice: Slice,
): readonly PlacedConjunct[] {
  const counts = new Map<string, number>();
  return canonicalizeSlice(slice).filter.map((predicate) => {
    const { field, operator } = predicate;
    const address = `${field}\u0000${operator}`;
    const nth = counts.get(address) ?? 0;
    counts.set(address, nth + 1);
    return { predicate, ref: { field, operator, nth } };
  });
}
