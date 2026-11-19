import expandServedRange from "./expandServedRange.js";
import type { ServedGraph } from "./types.js";

/**
 * Count the relations a site's graph serves between each pair of its
 * loaded namespaces, as a region's label row names its bridges: each
 * object property from its domain's namespace to its range's, whichever
 * way it runs.
 *
 * @param graph - The served graph.
 * @returns The counts, keyed by the two prefixes in code-unit order and a
 *   space.
 */
export default function countServedBridges(
  graph: ServedGraph,
): ReadonlyMap<string, number> {
  const prefixOf = new Map(
    graph.ontologies.flatMap((ontology) =>
      ontology.classes.map((klass) => [klass.uri, ontology.prefix] as const),
    ),
  );
  const expand = expandServedRange(graph);
  const counts = new Map<string, number>();
  for (const property of graph.ontologies.flatMap((o) => o.properties)) {
    if (property.kind !== "OBJECT" || property.domain === null) continue;
    const from = prefixOf.get(property.domain.uri);
    const to = prefixOf.get(expand(property.range));
    if (from === undefined || to === undefined || from === to) continue;
    const key = [from, to].sort().join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
