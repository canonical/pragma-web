import type { OntologyNamespace } from "./types.js";

/**
 * Compact an absolute IRI into its prefixed form
 * (`https://metro.example/onto#servesLine` → `metro:servesLine`), the form a
 * reader meets everywhere else the graph is shown.
 *
 * The longest namespace match wins, so one namespace being a prefix of
 * another can never mis-split, and the bare namespace compacts to `prefix:`,
 * which `expandAddress` turns back into it. It is total: a value no
 * namespace matches, an IRI of an undeclared namespace or a range the graph
 * already states compactly (`metro:Line`, `Int`), passes through unchanged.
 *
 * @param iri - The IRI to compact.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The compact form, or `iri` unchanged.
 */
export default function compactIri(
  iri: string,
  namespaces: readonly OntologyNamespace[],
): string {
  let best: OntologyNamespace | undefined;
  for (const candidate of namespaces) {
    if (
      iri.startsWith(candidate.namespace) &&
      (best === undefined || candidate.namespace.length > best.namespace.length)
    ) {
      best = candidate;
    }
  }
  if (best === undefined) return iri;
  return `${best.prefix}:${iri.slice(best.namespace.length)}`;
}
