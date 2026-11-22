/**
 * `@canonical/prism-contract/browser` — the part of the contract a browser
 * loads: the site lens model, its resolver, the list fields it derives and
 * the pure helpers client code may import.
 *
 * The package's root also reads the shipped SDL from disk when it loads,
 * which a browser cannot do. This entry imports nothing that touches the
 * filesystem, so client code, and a server bundle that does not carry the
 * `schema/` directory, imports runtime values from here and only types from
 * the root.
 *
 * @module prism-contract/browser
 */

export { default as compactIri } from "../lib/compactIri.js";
export { default as compareCodePoints } from "../lib/compareCodePoints.js";
export * from "../lib/lens/index.js";
export type { PrefixBinding } from "../lib/types.js";
