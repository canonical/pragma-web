import type { ServedGraph } from "./types.js";

/**
 * Build the reader of a served property's range: a range may be served
 * compact, as `ds:UIBlock`, and reads back as the IRI its loaded prefix
 * names; a full IRI, or a prefix no ontology loads, reads as served.
 *
 * @param graph - The site's served graph, for its namespaces.
 * @returns The range's IRI.
 */
export default function expandServedRange(
  graph: ServedGraph,
): (range: string) => string {
  const namespaceOf = new Map(
    graph.ontologies.map((ontology) => [ontology.prefix, ontology.namespace]),
  );
  return (range) => {
    const [prefix = "", local = ""] = range.split(/:(.*)/s);
    const namespace = namespaceOf.get(prefix);
    return range.includes("://") || namespace === undefined
      ? range
      : `${namespace}${local}`;
  };
}
