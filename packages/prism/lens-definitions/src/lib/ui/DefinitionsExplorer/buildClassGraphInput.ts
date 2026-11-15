import type { DefinitionsExplorer_ontologies$data } from "../../../__generated__/DefinitionsExplorer_ontologies.graphql.js";
import type {
  ClassEdgeInput,
  ClassGraphInput,
} from "../../classGraph/types.js";
import compactUri from "../../compactUri.js";
import expandUri from "../../expandUri.js";

/**
 * Turn the explorer's ontologies into the class graph's input: every class
 * with its label (its compact term when it has none), its ontology's prefix,
 * its abstractness, superclass, instance count and field count (its
 * datatype properties, inherited ones included), and every object property
 * as a relation from its domain to its range, a compact range expanded to
 * the full IRI the classes carry, weighed by the statements its declared
 * edges cover (0 when none does). An observed pair nothing declares adds
 * nothing to a relation's count.
 *
 * @param ontologies - The explorer fragment's data.
 * @param edges - The graph's class edges.
 * @returns The input the layout reads.
 */
export default function buildClassGraphInput(
  ontologies: DefinitionsExplorer_ontologies$data,
  edges: readonly ClassEdgeInput[],
): ClassGraphInput {
  const counts = new Map<string, number>();
  for (const edge of edges.filter((candidate) => candidate.declared)) {
    counts.set(edge.property, (counts.get(edge.property) ?? 0) + edge.count);
  }
  return {
    classes: ontologies.flatMap((ontology) =>
      ontology.classes.map((klass) => ({
        uri: klass.uri,
        label: klass.label ?? compactUri(klass.uri, [ontology]),
        prefix: ontology.prefix,
        abstract: klass.isAbstract,
        superclass: klass.superclass?.uri ?? null,
        instanceCount: klass.instanceCount,
        fields: klass.properties.filter(
          (classProperty) => classProperty.property.kind === "DATATYPE",
        ).length,
      })),
    ),
    relations: ontologies.flatMap((ontology) =>
      ontology.properties
        .filter((property) => property.kind === "OBJECT")
        .map((property) => ({
          uri: property.uri,
          label: property.label ?? compactUri(property.uri, [ontology]),
          domain: property.domain?.uri ?? null,
          range: expandUri(property.range, ontologies),
          count: counts.get(property.uri) ?? 0,
        })),
    ),
  };
}
