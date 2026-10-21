/**
 * The classes the lobby's three counted doors read, one per door.
 *
 * Each value is a GraphQL variable for `ontologyClass(uri:)`, and the three
 * share the same two rules:
 *
 * - PREFIXED FORM ONLY. `ontologyClass(uri:)` accepts the prefixed form and
 *   echoes back the absolute IRI, so none of these may be compared against a
 *   `uri` the graph returned. Compare returned IRIs with each other, or pass
 *   the returned one through `toPrefixedUri` first.
 * - A MODULE CONSTANT, NOT AN ENVIRONMENT VARIABLE. The SSR prepare step and
 *   the client hydration must compute byte-identical variables, or the warmed
 *   store does not fulfil the client's operation. A `VITE_*` variable resolves
 *   differently in the client build and in the SSR renderer; a constant
 *   cannot diverge.
 */

/** The class the components door counts. */
export const LOBBY_COMPONENT_CLASS = "ds:Component";

/** The class the patterns door counts. */
export const LOBBY_PATTERN_CLASS = "ds:Pattern";

/** The class the standards door counts. */
export const LOBBY_STANDARD_CLASS = "cs:CodeStandard";
