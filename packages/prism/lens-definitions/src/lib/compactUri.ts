import type { OntologyNamespace } from "./types.js";

/**
 * Compact an ontology term's full IRI into its prefixed form
 * (`https://ds.canonical.com/UIBlock` → `ds:UIBlock`).
 *
 * The ontology GraphQL surface returns FULL IRIs from every `uri` field on
 * `Ontology.classes` / `Ontology.properties` and on class/property lookups,
 * while the lens's term addresses — the `/definitions/:term` param and
 * term-chip hrefs — use the compact prefixed form. The prefixes come from
 * the ontologies' own (prefix, namespace) pairs, which ride the explorer
 * query — never a hardcoded namespace table, so a new ontology needs no code
 * change here.
 *
 * The longest namespace match wins, so one namespace being a prefix of
 * another can never mis-split. It is total: a URI that matches no known
 * namespace passes through unchanged, because a term address must never make
 * the page throw — the inspector's not-found branch owns unknown terms.
 */
export default function compactUri(
  uri: string,
  namespaces: readonly OntologyNamespace[],
): string {
  let best: OntologyNamespace | undefined;
  for (const candidate of namespaces) {
    if (
      uri.startsWith(candidate.namespace) &&
      uri.length > candidate.namespace.length &&
      (best === undefined || candidate.namespace.length > best.namespace.length)
    ) {
      best = candidate;
    }
  }
  if (best === undefined) return uri;
  return `${best.prefix}:${uri.slice(best.namespace.length)}`;
}
