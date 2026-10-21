/**
 * The route-facet helper: how a route annotates itself, and how anything
 * reads those annotations back off the route table.
 *
 * @module
 */

export { default as collectFacet } from "./collectFacet.js";
export { default as defineFacet } from "./defineFacet.js";
export type { FacetBearer, RouteFacet, RouteMeta } from "./types.js";
