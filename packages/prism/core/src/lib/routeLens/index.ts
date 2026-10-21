/**
 * The lens declaration: a lens's index route declares the lens on its own
 * `meta`, and the rail reads the set back off the route table.
 *
 * @module
 */

export { collectLenses } from "./collectLenses.js";
export { ROUTE_LENS_META_KEY } from "./constants.js";
export { routeLensFacet } from "./lensFacet.js";
export type { CollectedLens, LensEntry, LensTier } from "./types.js";
