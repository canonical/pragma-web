import type { StandardsBinding } from "@canonical/prism-lens-standards";

/**
 * The class the Standards lens enumerates: the index lists its instances,
 * and the reading page checks that the node it loaded is one.
 *
 * Prefixed form only: `ontologyClass(uri:)` accepts it and echoes back the
 * absolute IRI, so this value is never compared against a `uri` the graph
 * returned. It is a module constant rather than an environment variable
 * because it becomes a GraphQL variable, and the SSR prepare step and the
 * client hydration must compute byte-identical variables for the warmed
 * store to fulfil the client's operation; a `VITE_*` variable resolves
 * differently in the client build and in the SSR renderer.
 */
export const STANDARDS_BINDING = {
  classUri: "cs:CodeStandard",
} as const satisfies StandardsBinding;

/**
 * The namespace the `cs:` prefix names. A mention of a standard hands its
 * home the compact address, and the Standards lens addresses a reading page
 * by the absolute IRI, the one form `node(id:)` accepts, so the site's home
 * for a standard expands the prefix with it.
 */
export const CODE_STANDARDS_NAMESPACE =
  "http://pragma.canonical.com/codestandards#";
