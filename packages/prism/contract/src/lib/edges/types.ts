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
 * Instance statements a store holds for one property between two classes,
 * each statement counted under its subject's and object's asserted classes.
 */
export interface ClassEdgeObservation {
  readonly property: string;
  readonly subjectClass: string;
  readonly objectClass: string;
  readonly count: number;
}
