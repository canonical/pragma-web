import collapseSortTerms from "./collapseSortTerms.js";
import compareConjuncts from "./compareConjuncts.js";
import { OPERATOR_ARITY } from "./constants.js";
import rankOperand from "./rankOperand.js";
import type { GroupTerm, Predicate, PredicateOperand, Slice } from "./types.js";

/** Canonicalize one predicate: a set operator's operands become an ordered set. */
const canonicalPredicate = (predicate: Predicate): Predicate => {
  if (OPERATOR_ARITY[predicate.operator] !== "many") {
    return {
      field: predicate.field,
      operator: predicate.operator,
      operands: [...predicate.operands],
    };
  }
  const sorted = [...predicate.operands].sort((a, b) => {
    const left = rankOperand(a);
    const right = rankOperand(b);
    return left < right ? -1 : left > right ? 1 : 0;
  });
  const operands: PredicateOperand[] = [];
  for (const operand of sorted) {
    const last = operands.at(-1);
    if (last === undefined || rankOperand(last) !== rankOperand(operand)) {
      operands.push(operand);
    }
  }
  // Rebuild in a fixed key order so fingerprints are invariant under
  // key-order respelling of the input.
  return { field: predicate.field, operator: predicate.operator, operands };
};

/**
 * Normalize a slice to its canonical form: set operands are sets, every
 * conjunct is kept — two on one address both restrict — ordered by
 * address and then by operands, and only identical conjuncts collapse,
 * since `A AND A` is `A`; sort and group terms keep their order
 * with a repeated sort field collapsed to its first occurrence, and an empty
 * search is no search. Idempotent:
 * `canonicalizeSlice(canonicalizeSlice(x))` equals `canonicalizeSlice(x)`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function canonicalizeSlice(slice: Slice): Slice {
  const sorted = slice.filter.map(canonicalPredicate).sort(compareConjuncts);
  const filter: Predicate[] = [];
  for (const predicate of sorted) {
    const last = filter.at(-1);
    if (last === undefined || compareConjuncts(last, predicate) !== 0) {
      filter.push(predicate);
    }
  }
  return {
    filter,
    search: slice.search === "" ? null : slice.search,
    sort: collapseSortTerms(slice.sort),
    group: slice.group.map((term): GroupTerm => ({ field: term.field })),
  };
}
