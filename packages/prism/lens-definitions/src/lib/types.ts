import type { ABSTRACTION_VALUES } from "./constants.js";

/** A value of the abstraction axis: whether a class is abstract. */
export type Abstraction = (typeof ABSTRACTION_VALUES)[number];

/**
 * The lens's whole ephemeral state. `namespaces`/`abstractions` are
 * ALLOW-lists: a term shows undimmed when its facets are both allowed.
 * An EMPTY allow-list means "no chip on this axis is lit", which dims
 * every term on that axis — the honest reading of "you turned everything
 * off", and exactly what the exhibit's chips do.
 */
export interface LensFilter {
  /** The rail's search text, already trimmed and lower-cased. */
  readonly text: string;
  /** Allowed abstraction values. */
  readonly abstractions: readonly Abstraction[];
  /** Allowed ontology prefixes (`ds`, `cs`, `anatomy`). */
  readonly namespaces: readonly string[];
}

/** One ontology's addressing identity, as the graph states it. */
export interface OntologyNamespace {
  /** The compact prefix, e.g. `ds`. */
  readonly prefix: string;
  /** The full namespace IRI, e.g. `https://ds.canonical.com/`. */
  readonly namespace: string;
}
