import { prefetchQuery } from "@canonical/prism-core";
import buildSearchVariables from "./buildSearchVariables.js";
import { searchQueryNode } from "./searchQuery.js";
import { readSearchState } from "./searchValues.js";
import type { SearchValues } from "./types.js";

/**
 * Warm the store for the search page: prefetch `MetroSearchQuery` for the
 * address's text, type and page; nothing for an address with no text,
 * whose page queries nothing. The search route declares it as its `warm`.
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
  if (text.trim() === "") return Promise.resolve();
  return prefetchQuery(searchQueryNode, buildSearchVariables(text, state));
}
