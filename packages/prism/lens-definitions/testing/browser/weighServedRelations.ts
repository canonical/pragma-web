import type { ServedGraph, ServedWeights } from "./types.js";

/**
 * Weigh the relations a site's graph serves as the explorer draws them:
 * each object property runs from its domain to its range, weighed by the
 * count served for its declared edge between the two (0 when none), and
 * a drawn edge between two classes weighs its heaviest relation. Count
 * the bridges too: the relations that leave a loaded class for a class of
 * another namespace or of none loaded.
 */
export default function weighServedRelations(
  graph: ServedGraph,
): ServedWeights {
  const prefixOf = new Map(
    graph.ontologies.flatMap((ontology) =>
      ontology.classes.map((klass) => [klass.uri, ontology.prefix] as const),
    ),
  );
  const namespaceOf = new Map(
    graph.ontologies.map((ontology) => [ontology.prefix, ontology.namespace]),
  );
  const termOf = (uri: string, prefix: string): string =>
    `${prefix}:${uri.slice((namespaceOf.get(prefix) ?? "").length)}`;
  // A range may be served compact, as `ds:UIBlock`.
  const expand = (range: string): string => {
    const [prefix = "", local = ""] = range.split(/:(.*)/s);
    const namespace = namespaceOf.get(prefix);
    return range.includes("://") || namespace === undefined
      ? range
      : `${namespace}${local}`;
  };
  const counts = new Map(
    graph.classEdges
      .filter((edge) => edge.declared)
      .map((edge) => [
        `${edge.property} ${edge.subjectClass} ${edge.objectClass}`,
        edge.count,
      ]),
  );
  const weights = new Map<string, number>();
  let bridges = 0;
  for (const property of graph.ontologies.flatMap((o) => o.properties)) {
    if (property.kind !== "OBJECT" || property.domain === null) continue;
    const domain = property.domain.uri;
    const range = expand(property.range);
    const from = prefixOf.get(domain);
    const to = prefixOf.get(range);
    if (from === undefined) continue;
    if (from !== to) bridges += 1;
    if (to === undefined) continue;
    const key = [termOf(domain, from), termOf(range, to)].sort().join(" ");
    const count = counts.get(`${property.uri} ${domain} ${range}`) ?? 0;
    weights.set(key, Math.max(weights.get(key) ?? 0, count));
  }
  return { weights, bridges };
}
