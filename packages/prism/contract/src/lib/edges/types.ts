/**
 * Class edges: how often a property links instances of one class to
 * instances of another, against the edges the ontology declares.
 *
 * Type-only: no runtime code lives here, which is why the coverage config
 * excludes this file.
 */

/** One weighted edge between two classes. */
export interface ClassEdge {
  /** The property's IRI. */
  readonly property: string;
  /** The IRI of the class the statements start from. */
  readonly subjectClass: string;
  /** The IRI of the class the statements point to. */
  readonly objectClass: string;
  /** The number of instance statements the edge covers; 0 when none. */
  readonly count: number;
  /** Whether the ontology declares the edge, through a domain and range. */
  readonly declared: boolean;
}

/** An edge the ontology declares: a property with its domain and range. */
export interface ClassEdgeDeclaration {
  readonly property: string;
  readonly domain: string;
  readonly range: string;
}

/**
 * Instance statements a store holds for one property between two classes.
 *
 * Each statement is counted in exactly one observation, under one class pair.
 * When its subject or object carries several asserted classes, the provider
 * attributes the statement to one of them, so the observations of a property
 * sum to its number of statements and no edge counts a statement twice.
 */
export interface ClassEdgeObservation {
  readonly property: string;
  readonly subjectClass: string;
  readonly objectClass: string;
  readonly count: number;
}
