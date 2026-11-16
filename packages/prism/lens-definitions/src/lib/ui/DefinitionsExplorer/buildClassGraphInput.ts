import type { DefinitionsExplorer_ontologies$data } from "../../../__generated__/DefinitionsExplorer_ontologies.graphql.js";
import type {
  ClassEdgeInput,
  ClassGraphInput,
} from "../../classGraph/types.js";
import countNamespaceRelations from "../../classGraph/countNamespaceRelations.js";
import compactUri from "../../compactUri.js";
import expandUri from "../../expandUri.js";

/**
 * Turn the explorer's ontologies into the class graph's input: every class
 * with its label (its compact term when it has none), its ontology's prefix,
 * its abstractness, superclass, instance count and field count (its
 * datatype properties, inherited ones included), and every object property
 * as a relation from its domain to its range, a compact range expanded to
 * the full IRI the classes carry, weighed by the count the graph serves
 * for its declared edge between its domain and its range (0 when it
 * serves none). A declared edge between other classes, and an observed
 * pair nothing declares, add nothing to a relation's count. A relation
 * with an end in no loaded namespace is not counted (`null`) unless the
 * graph counts statements for it: the store counts a statement under its
 * object's class, which it does not know for a namespace it does not load.
 *
 * @param ontologies - The explorer fragment's data.
 * @param edges - The graph's class edges.
 * @returns The input the layout reads.
 */
export default function buildClassGraphInput(
  ontologies: DefinitionsExplorer_ontologies$data,
  edges: readonly ClassEdgeInput[],
): ClassGraphInput {
  const loaded = new Set(
    ontologies.flatMap((ontology) => ontology.classes.map(({ uri }) => uri)),
  );
  const counts = new Map(
    edges
      .filter((edge) => edge.declared)
      .map((edge) => [
        keyEdge(edge.property, edge.subjectClass, edge.objectClass),
        edge.count,
      ]),
  );
  return {
    namespaceRelations: new Map(
      ontologies.map((ontology) => [
        ontology.prefix,
        countNamespaceRelations(ontology.properties),
      ]),
    ),
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
        .map((property) => {
          const domain = property.domain?.uri ?? null;
          const range = expandUri(property.range, ontologies);
          const count =
            domain === null
              ? 0
              : (counts.get(keyEdge(property.uri, domain, range)) ?? 0);
          const measured =
            count > 0 ||
            domain === null ||
            (loaded.has(domain) && loaded.has(range));
          return {
            uri: property.uri,
            label: property.label ?? compactUri(property.uri, [ontology]),
            domain,
            range,
            count: measured ? count : null,
          };
        }),
    ),
  };
}

/**
 * Key a property's edge between two classes, as the graph serves one count
 * for each.
 *
 * @param property - The property's full IRI.
 * @param subject - The full IRI of the class its statements start from.
 * @param object - The full IRI of the class they point to.
 * @returns The edge's key.
 */
function keyEdge(property: string, subject: string, object: string): string {
  return `${property} ${subject} ${object}`;
}
