import layOutClassGraph from "../src/lib/classGraph/layOutClassGraph.js";
import type {
  ClassGraphInput,
  ClassGraphLayout,
} from "../src/lib/classGraph/types.js";
import nameClassGraphTerms from "./nameClassGraphTerms.js";
import ontologyGraph from "./records/ontologyGraph.js";

/** A class graph laid out, with each class's and relation's compact term. */
export interface ClassGraphSetup {
  readonly layout: ClassGraphLayout;
  /** Each class's and relation's compact term, by IRI. */
  readonly terms: ReadonlyMap<string, string>;
  /** Each class's IRI by its compact term. */
  readonly uris: ReadonlyMap<string, string>;
}

/**
 * Lay a class graph out and name each class by its compact term, its
 * prefix and the IRI's last segment, as the explorer names it; a
 * relation by the prefix of a class in its namespace, as a count's
 * numeral links to it.
 *
 * @param input - The classes and relations; the real ontology by default.
 * @returns The layout and the terms both ways.
 */
export default function createClassGraphSetup(
  input: ClassGraphInput = ontologyGraph,
): ClassGraphSetup {
  const terms = nameClassGraphTerms(input);
  const classUris = new Set(input.classes.map((klass) => klass.uri));
  return {
    layout: layOutClassGraph(input),
    terms,
    uris: new Map(
      [...terms]
        .filter(([uri]) => classUris.has(uri))
        .map(([uri, term]) => [term, uri]),
    ),
  };
}
