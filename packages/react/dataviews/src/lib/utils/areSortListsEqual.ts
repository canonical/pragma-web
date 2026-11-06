import type { SortTerm } from "@canonical/dataviews-core";

/**
 * Whether two orderings say the same thing. A placeholder that answers no
 * until the comparison lands, so the rows that pin it can be seen failing.
 */
export default function areSortListsEqual(
  _terms: readonly SortTerm[],
  _others: readonly SortTerm[],
): boolean {
  return false;
}
