/**
 * Test-only types shared by this package's tests.
 */

import type { CompilerContext } from "@canonical/ke-graphql";
import type { GraphQLResolveInfo } from "graphql";

/**
 * One reference-extraction case: a CommonMark document and the IRIs it must
 * yield, in order.
 */
export interface ExtractionCase {
  readonly name: string;
  readonly markdown: string;
  readonly expected: readonly string[];
}

/**
 * The resolvers a probe schema is built from. A resolver left out leaves its
 * field out of the schema.
 */
export interface ProbeSchemaResolvers {
  /** Resolves `Query.node(id:)` to a `Thing`, or null. */
  readonly resolveNode?: (id: string) => unknown;
  /** Resolves `Query.edges(iris:)` to a list of `Edge`. */
  readonly resolveEdges?: (
    iris: readonly string[],
    context: CompilerContext,
    info: GraphQLResolveInfo,
  ) => unknown;
}

/**
 * One ranking case: search text and the IRIs `rankSearchEntries` must
 * return for it over the search fixtures, best first.
 */
export interface RankingCase {
  readonly name: string;
  readonly text: string;
  readonly expected: readonly string[];
}

/** A field's section, as `ontologyClass` serves it. */
export interface LensReadingGroup {
  readonly uri: string;
  readonly label: string | null;
  readonly order: number | null;
}

/** A property's own lens, as `ontologyClass` serves it on a class's field. */
export interface LensReadingProperty {
  readonly uri: string;
  readonly visibility: string | null;
  readonly pluralLabel: string | null;
  readonly inverseLabel: string | null;
  readonly inversePluralLabel: string | null;
  readonly inverseVisibility: string | null;
}

/** One field of a class with its lens, as `ontologyClass` serves it. */
export interface LensReadingField {
  readonly property: LensReadingProperty;
  readonly group: LensReadingGroup | null;
  readonly order: number | null;
  readonly role: string | null;
  readonly visibility: string | null;
}

/** A class with its lens and its fields' lenses, as `ontologyClass` serves it. */
export interface LensReadingClass {
  readonly uri: string;
  readonly visibility: string | null;
  readonly glyph: string | null;
  readonly pluralLabel: string | null;
  readonly properties: readonly LensReadingField[];
}

/** A term as `Query.ontologies` serves it, with its description. */
export interface ServedTerm {
  readonly uri: string;
  readonly definition: string | null;
}

/** A property as `Query.ontologies` serves it, with its relation's other side. */
export interface ServedProperty extends ServedTerm {
  readonly inverse: ServedTerm | null;
}

/** An ontology's classes and properties as `Query.ontologies` serves them. */
export interface ServedOntology {
  readonly classes: readonly ServedTerm[];
  readonly properties: readonly ServedProperty[];
}
