import expandServedRange from "./expandServedRange.js";
import type { ServedGraph } from "./types.js";

/**
 * Count the nodes a term page draws for a class of a site's served graph:
 * its one-hop neighbourhood over both edge kinds, as the explorer lays it.
 * That is the class, its superclass, its subclasses and every class one
 * object property away in either direction, with one stub for each range
 * no ontology loads.
 *
 * @param graph - The site's served graph, with each class's superclass.
 * @param focus - The focus class's IRI.
 * @returns How many nodes the neighbourhood draws.
 */
export default function countServedNeighbourhood(
  graph: ServedGraph,
  focus: string,
): number {
  const expand = expandServedRange(graph);
  const classes = graph.ontologies.flatMap((ontology) => ontology.classes);
  const near = new Set([focus]);
  for (const klass of classes) {
    const superclass = klass.superclass?.uri;
    if (klass.uri === focus && superclass !== undefined) near.add(superclass);
    if (superclass === focus) near.add(klass.uri);
  }
  for (const property of graph.ontologies.flatMap((o) => o.properties)) {
    if (property.kind !== "OBJECT" || property.domain === null) continue;
    const range = expand(property.range);
    if (property.domain.uri === focus) near.add(range);
    if (range === focus) near.add(property.domain.uri);
  }
  return near.size;
}
