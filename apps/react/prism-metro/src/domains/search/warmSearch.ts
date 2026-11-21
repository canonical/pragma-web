import { prefetchQuery, type ViewSearch } from "@canonical/prism-core";
import buildSearchVariables from "./buildSearchVariables.js";
import readSearchText from "./readSearchText.js";
import { searchQueryNode } from "./searchQuery.js";

/**
 * Warm the store for the search page: prefetch `MetroSearchQuery` for the
 * address's text. The search route declares it as its `warm`.
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
  search: ViewSearch,
): Promise<void> {
  return prefetchQuery(
    searchQueryNode,
    buildSearchVariables(readSearchText(search)),
  );
}
