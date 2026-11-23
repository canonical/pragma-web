import type { Predicate } from "@canonical/dataviews-core";
import type { QueryBarDraft, QueryRangeClause } from "./types.js";

/**
 * One bound of a range as the draft an edit of its value starts from: the
 * bound's conjunct, standing under the range's id, so its Entry stands in
 * the range's chip. Pure.
 *
 * @param clause - The range.
 * @param bound - Which bound: 0 for the lower, 1 for the upper.
 * @param predicate - The bound's conjunct as it applies.
 * @returns The bound as an edit's draft.
 */
export default function readRangeBound(
  clause: QueryRangeClause,
  bound: 0 | 1,
  predicate: Predicate,
): QueryBarDraft {
  return {
    kind: "predicate",
    origin: { id: clause.id, ref: clause.refs[bound], held: predicate },
    field: predicate.field,
    operator: predicate.operator,
    operands: predicate.operands,
  };
}
