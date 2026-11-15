/**
 * The package's helpers: over colours from a graph, the gate every mark
 * and swatch passes its colour through, which the package keeps internal;
 * over graph addresses, a compact address's prefix,
 * which the package exports for a site's own projections, and an IRI's
 * local name, which it keeps internal; over switches, the case's fragment
 * key, which every switch over a node's typename reads, the sites' too.
 *
 * @module
 */

export { default as acceptColour } from "./acceptColour.js";
export { default as findCuriePrefix } from "./findCuriePrefix.js";
export { default as findLocalName } from "./findLocalName.js";
export { default as requireArmKey } from "./requireArmKey.js";
