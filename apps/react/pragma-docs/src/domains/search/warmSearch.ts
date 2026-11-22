import { prefetchQuery } from "@canonical/prism-core";
import buildSearchVariables from "./buildSearchVariables.js";
import { SEARCH_DOOR_CLASSES } from "./constants.js";
import { searchDoorsQueryNode } from "./searchDoorsQuery.js";
import { searchQueryNode } from "./searchQuery.js";
import { readSearchState } from "./searchValues.js";
import type { SearchValues } from "./types.js";

/**
 * Warm the store for the search page: prefetch `DocsSearchQuery` for the
 * address's text, type and page; for an address with no text,
 * `DocsSearchDoorsQuery`, the doors' totals. The search route declares it
 * as its `warm`.
 *
 * @param _params - The route's params; the search route has none.
 * @param search - The route's search values, which carry the text.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the published prefetch environment through
 *   `prefetchQuery`, which reads that environment at the moment of the call.
 */
export default function warmSearch(
  _params: unknown,
  search: SearchValues,
): Promise<void> {
  const { text, ...state } = readSearchState(search);
  if (text.trim() === "") {
    return prefetchQuery(searchDoorsQueryNode, { ...SEARCH_DOOR_CLASSES });
  }
  return prefetchQuery(searchQueryNode, buildSearchVariables(text, state));
}
