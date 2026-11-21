import nameStubs from "../../classGraph/nameStubs.js";
import type { StubName } from "../../classGraph/types.js";
import compactUri from "../../compactUri.js";
import type { OntologyNamespace } from "../../types.js";

/**
 * Name the terms of an edge table as the canvas names them: a loaded
 * namespace's term by its prefix and local name, a term no loaded
 * namespace holds by the stub's own short name, so that a table's cell
 * never shows a whole IRI where the canvas shows `prefix:Local`.
 *
 * @param iris - The full IRIs the table's cells show.
 * @param namespaces - The loaded ontologies' (prefix, namespace) pairs.
 * @returns Each term's prefix, local name and compact term, by IRI.
 */
export default function nameTableTerms(
  iris: readonly string[],
  namespaces: readonly OntologyNamespace[],
): ReadonlyMap<string, StubName> {
  const names = new Map<string, StubName>();
  const unloaded: string[] = [];
  for (const iri of iris) {
    const term = compactUri(iri, namespaces);
    const colon = term.indexOf(":");
    if (term === iri || colon < 0) {
      unloaded.push(iri);
      continue;
    }
    names.set(iri, {
      prefix: term.slice(0, colon),
      local: term.slice(colon + 1),
      term,
    });
  }
  const stubs = nameStubs(
    unloaded,
    new Set(namespaces.map(({ prefix }) => prefix)),
  );
  for (const [iri, name] of stubs) names.set(iri, name);
  return names;
}
