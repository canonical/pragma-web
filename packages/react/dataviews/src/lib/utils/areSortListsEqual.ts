import type { SortTerm } from "@canonical/dataviews-core";
import { areListsEqual } from "@canonical/dataviews-core/bindings";
import areSortTermsEqual from "./areSortTermsEqual.js";

/**
 * Whether two orderings say the same thing: the same terms, each on one
 * field in one direction, in the same order.
 */
export default function areSortListsEqual(
  terms: readonly SortTerm[],
  others: readonly SortTerm[],
): boolean {
  return areListsEqual(terms, others, areSortTermsEqual);
}
