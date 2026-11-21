import { SEARCH_PAGE_SIZE } from "./constants.js";
import type { DocsSearchQuery$variables } from "./searchQuery.js";

/**
 * Build the variables of `DocsSearchQuery` for a search text: the text
 * trimmed, and one page of results.
 *
 * @param text - The search text, as the address holds it.
 * @returns The query's variables.
 */
export default function buildSearchVariables(
  text: string,
): DocsSearchQuery$variables {
  return { text: text.trim(), first: SEARCH_PAGE_SIZE };
}
