import { SEARCH_PAGE_SIZE } from "./constants.js";
import type { MetroSearchQuery$variables } from "./searchQuery.js";
import type { SearchState } from "./types.js";

/**
 * Build the variables of `MetroSearchQuery` for a search text: the text
 * trimmed and one page of results; with the page's state, the applied
 * type, the cursor the page starts after, from the second page the size
 * of the window that ends where the page starts (whose types tell the
 * groups that continue), and from the third page the size of the window
 * that ends where the previous page starts.
 *
 * @param text - The search text, as the address holds it.
 * @param state - The applied type, cursor and page, when the address has them.
 * @returns The query's variables.
 */
export default function buildSearchVariables(
  text: string,
  state: Partial<Omit<SearchState, "text">> = {},
): MetroSearchQuery$variables {
  const { type, after, page = 1 } = state;
  return {
    text: text.trim(),
    first: SEARCH_PAGE_SIZE,
    ...(type === undefined ? {} : { types: [type] }),
    ...(after === undefined ? {} : { after }),
    ...(page > 1
      ? { hasEarlier: true, earlierFirst: SEARCH_PAGE_SIZE * (page - 1) }
      : {}),
    ...(page > 2
      ? { hasPrevious: true, previousFirst: SEARCH_PAGE_SIZE * (page - 2) }
      : {}),
  };
}
