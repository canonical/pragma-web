import type { ViewSearch } from "@canonical/prism-core";

/**
 * Read the search text from a route's search values: the `q` parameter,
 * or no text when the address carries none.
 *
 * @param search - The route's search values.
 * @returns The text to search for, as the address holds it.
 */
export default function readSearchText(search: ViewSearch): string {
  return search.q ?? "";
}
