/**
 * The boot-time probe for one binding: does the graph know the class the
 * binding names? A plain string, not a compiled operation, because it runs
 * through whatever `execute` the site hands in.
 */
export const BINDING_PROBE_QUERY =
  "query PrismCoreBindingProbe($uri: String!) { ontologyClass(uri: $uri) { uri } }";

/**
 * A binding id: a lower-camel-case identifier, so a lens can derive names
 * from it (`${id}Entity`) that are valid route names and GraphQL names.
 */
export const BINDING_ID_PATTERN = /^[a-z][A-Za-z0-9]*$/;
