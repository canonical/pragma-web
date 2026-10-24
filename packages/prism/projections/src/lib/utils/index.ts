/**
 * The package's helpers over graph addresses: a compact address's prefix,
 * which the package exports for a site's own projections, and an IRI's
 * local name, which it keeps internal.
 *
 * @module
 */

export { default as findCuriePrefix } from "./findCuriePrefix.js";
export { default as findLocalName } from "./findLocalName.js";
