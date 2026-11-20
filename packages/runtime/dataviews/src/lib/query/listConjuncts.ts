import canonicalizeSlice from "./canonicalizeSlice.js";
import type { Predicate, PredicateOperator, Slice } from "./types.js";

/**
 * The conjuncts a slice holds at one address, in canonical order: what a
 * conjunct's `nth` counts through. Each is the canonical copy, so its set
 * operands are an ordered set. Pure.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function listConjuncts(
  slice: Slice,
  field: string,
  operator: PredicateOperator,
): readonly Predicate[] {
  return canonicalizeSlice(slice).filter.filter(
    (predicate) => predicate.field === field && predicate.operator === operator,
  );
}
