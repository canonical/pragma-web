/**
 * The search domain's barrel: the index built once at boot from the
 * compiled schema, and the root field that ranks and pages it.
 *
 * @module search
 */

export { createSearchExtensions } from "./createSearchExtensions.js";
export { indexSearch } from "./indexSearch.js";
export type { SearchEntry, SearchIndex } from "./types.js";
