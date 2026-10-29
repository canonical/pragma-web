import type { OntologyNamespace } from "./types.js";

/**
 * Expand a compact term into the full IRI the graph's classes carry
 * (`metro:Line` → `https://metro.example/onto#Line`), the inverse of
 * `compactUri`.
 *
 * A provider may answer a property's `range` in either form (the metro
 * provider answers CURIEs, the pragma provider full IRIs), while a class's
 * `uri` is always the full IRI, so a range is expanded before it is
 * matched against a class. The namespaces are the ontologies' own (prefix,
 * namespace) pairs.
 *
 * It is total: a value already under a known namespace, or whose prefix no
 * ontology declares (an `xsd:` datatype, an IRI of another vocabulary),
 * passes through unchanged.
 *
 * @param term - A full IRI or a compact term.
 * @param namespaces - The ontologies' addressing identities.
 * @returns The full IRI, or `term` as given.
 */
export default function expandUri(
  term: string,
  namespaces: readonly OntologyNamespace[],
): string {
  if (namespaces.some((candidate) => term.startsWith(candidate.namespace))) {
    return term;
  }
  const colon = term.indexOf(":");
  if (colon <= 0) return term;
  const prefix = term.slice(0, colon);
  const declared = namespaces.find((candidate) => candidate.prefix === prefix);
  return declared === undefined
    ? term
    : `${declared.namespace}${term.slice(colon + 1)}`;
}
