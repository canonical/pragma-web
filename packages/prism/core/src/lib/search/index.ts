/**
 * What a site's search page reads besides its own query: the address's
 * values and state, the query's variables, the results grouped by type,
 * and the routes offered only when the provider serves `search`.
 *
 * @module
 */

export { default as buildSearchVariables } from "./buildSearchVariables.js";
export { SEARCH_PAGE_SIZE, SEARCH_RESULT_LIMIT } from "./constants.js";
export {
  default as groupSearchEdges,
  type GroupSearchOptions,
  orderSearchFacets,
  type SearchGroup,
} from "./groupSearchEdges.js";
export {
  default as offerSearchRoutes,
  type OfferedSearchRoutes,
} from "./offerSearchRoutes.js";
export { readSearchState, searchValues } from "./searchValues.js";
export type { SearchState, SearchValues, SearchVariables } from "./types.js";
