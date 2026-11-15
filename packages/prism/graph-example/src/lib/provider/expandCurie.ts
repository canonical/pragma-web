import type { ExampleOntology } from "./types.js";

/**
 * Expand a prefixed name (`"metro:Station"`) to an absolute IRI against the
 * declared ontologies. An absolute IRI passes through untouched: its scheme
 * is never a declared prefix.
 *
 * @param value - A prefixed name or an absolute IRI.
 * @param ontologies - The prefix and namespace pairs the dataset declares.
 * @returns The absolute IRI.
 */
export const expandCurie = (
  value: string,
  ontologies: readonly ExampleOntology[],
): string => {
  const colon = value.indexOf(":");
  const ontology = ontologies.find(
    (candidate) => candidate.prefix === value.slice(0, colon),
  );
  return ontology === undefined
    ? value
    : `${ontology.namespace}${value.slice(colon + 1)}`;
};
