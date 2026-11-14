import type { TermVisibility } from "@canonical/prism-contract";

/**
 * The boot-time probe for one binding: does the graph know the class the
 * binding names, and does its type lens show it? A plain string, not a
 * compiled operation, because it runs through whatever `execute` the site
 * hands in.
 */
export const BINDING_PROBE_QUERY =
  "query PrismCoreBindingProbe($uri: String!) { ontologyClass(uri: $uri) { uri visibility } }";

/**
 * The visibility a type lens gives a class whose instances are values, never
 * entities: no index may list them.
 */
export const HIDDEN_VISIBILITY: TermVisibility = "HIDDEN";

/**
 * A binding id: a lower-camel-case identifier, so a lens can derive names
 * from it (`${id}Entity`) that are valid route names and GraphQL names.
 */
export const BINDING_ID_PATTERN = /^[a-z][A-Za-z0-9]*$/;
