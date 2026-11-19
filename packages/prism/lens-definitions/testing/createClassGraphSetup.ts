import layOutClassGraph from "../src/lib/classGraph/layOutClassGraph.js";
import type {
  ClassGraphInput,
  ClassGraphLayout,
} from "../src/lib/classGraph/types.js";
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
  const nameTerm = (uri: string, prefix: string): string =>
    `${prefix}:${uri.split(/[#/:]/).at(-1)}`;
  const classTerms = new Map(
    input.classes.map((klass) => [klass.uri, nameTerm(klass.uri, klass.prefix)]),
  );
  const relationTerms = input.relations.map((relation) => {
    const base = relation.uri.replace(/[^#/:]+$/, "");
    const prefix =
      input.classes.find((klass) => klass.uri.startsWith(base))?.prefix ??
      base;
    return [relation.uri, nameTerm(relation.uri, prefix)] as const;
  });
  return {
    layout: layOutClassGraph(input),
    terms: new Map([...classTerms, ...relationTerms]),
    uris: new Map([...classTerms].map(([uri, term]) => [term, uri])),
  };
}
