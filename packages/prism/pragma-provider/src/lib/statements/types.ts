/**
 * The statements extension's types.
 */

import type { Term } from "@canonical/ke";

/** Which side of a statement the entity stands on. */
export type StatementDirection = "OUT" | "IN";

/** The arguments `Query.statements` takes. */
export interface StatementsArgs {
  /** The entity's absolute IRI. */
  readonly uri: string;
  /** Pairs of a predicate's local name and a zero-based index into its blank values. */
  readonly path?: readonly string[] | null;
  /** How many values each group returns; clamped to the contract's bounds. */
  readonly perPredicate?: number | null;
  /** Which side of its statements the entity stands on. */
  readonly direction?: StatementDirection | null;
}

/** One statement as read from one side: its predicate and the other side. */
export interface TermStatement {
  /** The predicate's absolute IRI. */
  readonly predicate: string;
  /** The term on the other side from the subject read. */
  readonly term: Term;
}

/** Each blank node's own statements, by the blank node's label. */
export type BlankStatements = ReadonlyMap<string, readonly TermStatement[]>;

/** One predicate's statements as a `StatementGroup` resolves them. */
export interface StatementGroupSource {
  /** The predicate's absolute IRI. */
  readonly predicate: string;
  /** How many statements the graph holds with this predicate. */
  readonly total: number;
  /** The values kept, in order, at most the bound asked for. */
  readonly terms: readonly Term[];
  /** How deep the group sits: 1 for the entity's own. */
  readonly depth: number;
  /** The statements of the blank nodes its values may name. */
  readonly blanks: BlankStatements;
  /** An IRI's compact form, which a foreign value is written in. */
  readonly compact: (uri: string) => string;
}

/** What `Query.statements` resolves to, before its fields resolve. */
export interface StatementGroupsSource {
  /** The entity's IRI, or null for a value reached by `path`. */
  readonly subject: string | null;
  /** The groups, in order. */
  readonly groups: readonly StatementGroupSource[];
  /** Every statement in this direction, before the bound. */
  readonly total: number;
}
