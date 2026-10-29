import layOutClassGraph from "../src/lib/classGraph/layOutClassGraph.js";
import type {
  ClassGraphInput,
  ClassGraphLayout,
} from "../src/lib/classGraph/types.js";
import ontologyGraph from "./records/ontologyGraph.js";

/** A class graph laid out, with each class's compact term by IRI. */
export interface ClassGraphSetup {
  readonly layout: ClassGraphLayout;
  readonly terms: ReadonlyMap<string, string>;
  /** Each class's IRI by its compact term. */
  readonly uris: ReadonlyMap<string, string>;
}

/**
 * Lay a class graph out and name each class by its compact term, its
 * prefix and the IRI's last segment, as the explorer names it.
 *
 * @param input - The classes and relations; the real ontology by default.
 * @returns The layout and the terms both ways.
 */
export default function createClassGraphSetup(
  input: ClassGraphInput = ontologyGraph,
): ClassGraphSetup {
  const terms = new Map(
    input.classes.map((klass) => [
      klass.uri,
      `${klass.prefix}:${klass.uri.split(/[#/:]/).at(-1)}`,
    ]),
  );
  return {
    layout: layOutClassGraph(input),
    terms,
    uris: new Map([...terms].map(([uri, term]) => [term, uri])),
  };
}
