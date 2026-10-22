import type { ABSTRACTION_VALUES } from "./constants.js";

/** A value of the abstraction axis: whether a class is abstract. */
export type Abstraction = (typeof ABSTRACTION_VALUES)[number];

/**
 * The lens's whole ephemeral state, resolved against the ontologies the
 * graph carries. `namespaces`/`abstractions` are ALLOW-lists: a term shows
 * undimmed when its facets are both allowed. An EMPTY allow-list means "no
 * chip on this axis is lit", which dims every term on that axis — the honest
 * reading of "you turned everything off".
 */
export interface LensFilter {
  /** The rail's search text, already trimmed and lower-cased. */
  readonly text: string;
  /** Allowed abstraction values. */
  readonly abstractions: readonly Abstraction[];
  /** Allowed ontology prefixes (`ds`, `cs`, `anatomy`). */
  readonly namespaces: readonly string[];
}

/**
 * The filter as the lens's shared state holds it. The state sits above the
 * query and cannot know the graph's prefixes, so `namespaces` stays
 * `undefined` until a reader presses an ontology chip; `resolveFilter` reads
 * that as every ontology lit. Once a chip is pressed it holds the allow-list,
 * which may be empty.
 */
export interface LensFilterState extends Omit<LensFilter, "namespaces"> {
  /** Allowed ontology prefixes, or `undefined` while no chip has been pressed. */
  readonly namespaces?: readonly string[] | undefined;
}

/** One ontology's addressing identity, as the graph states it. */
export interface OntologyNamespace {
  /** The compact prefix, e.g. `ds`. */
  readonly prefix: string;
  /** The full namespace IRI, e.g. `https://ds.canonical.com/`. */
  readonly namespace: string;
}
