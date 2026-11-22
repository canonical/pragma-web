/**
 * `@canonical/prism-contract/browser` — the pure helpers of the contract that
 * client code may import.
 *
 * The package root reads its SDL from the filesystem when it loads, so it
 * belongs to Node and Bun. This entry imports nothing that touches the
 * filesystem: a lens or a site bundled for the browser, or for a server
 * bundle that does not carry the `schema/` directory, imports from here.
 *
 * @module prism-contract/browser
 */

export { default as compactIri } from "./lib/compactIri.js";
export { default as compareCodePoints } from "./lib/compareCodePoints.js";
export type { PrefixBinding } from "./lib/types.js";
