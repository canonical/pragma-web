import type { QueryClause } from "../types.js";

/**
 * How many filter chips apply, as the bar's summaries count them: one per
 * conjunct, a range once, and neither the search nor a refused parameter.
 * Pure.
 *
 * @param clauses - The chips' clauses.
 * @returns The count.
 */
export default function countAppliedFilters(
  clauses: readonly QueryClause[],
): number {
  return clauses.filter(({ kind }) => kind === "predicate" || kind === "range")
    .length;
}
