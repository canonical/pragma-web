import type { ServedOntology, ServedTerm } from "./types.js";

/**
 * The query that reads every served term's description: each ontology's
 * classes and properties, and the other side of each relation.
 */
export const DESCRIPTION_COVERAGE_QUERY = `{
  ontologies {
    classes { uri definition }
    properties { uri definition inverse { uri definition } }
  }
}`;

/**
 * Every term `ontologies` serves, once each, and the IRIs of those that carry
 * no description: classes, properties and the other side of each relation.
 *
 * @param ontologies - The answer to {@link DESCRIPTION_COVERAGE_QUERY}.
 * @returns The served terms' IRIs and the undescribed ones, both sorted.
 */
export const listUndescribedTerms = (
  ontologies: readonly ServedOntology[],
): {
  readonly terms: readonly string[];
  readonly undescribed: readonly string[];
} => {
  const terms = new Map<string, ServedTerm>();
  for (const ontology of ontologies) {
    for (const term of [
      ...ontology.classes,
      ...ontology.properties,
      ...ontology.properties.flatMap((property) =>
        property.inverse === null ? [] : [property.inverse],
      ),
    ]) {
      terms.set(term.uri, term);
    }
  }
  const sorted = [...terms.values()].sort((a, b) =>
    a.uri < b.uri ? -1 : a.uri > b.uri ? 1 : 0,
  );
  return {
    terms: sorted.map((term) => term.uri),
    undescribed: sorted
      .filter((term) => (term.definition ?? "").trim() === "")
      .map((term) => term.uri),
  };
};
