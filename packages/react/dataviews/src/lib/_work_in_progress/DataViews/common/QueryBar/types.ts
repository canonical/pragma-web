import type {
  Predicate,
  PredicateCondition,
  PredicateEdit,
  PredicateRef,
  Query,
  QueryIssue,
} from "@canonical/dataviews-core";

/**
 * The query state the bar reads: the query, the saved view open beside it,
 * and the parameters a followed link carried that were refused. It stands
 * in for the store's query state until that lands, with the same shape.
 */
export type QueryStateStandIn = Query & {
  /** The saved view open beside the query, or null. */
  readonly view: string | null;
  /** The parameters the link carried that were refused; empty when clean. */
  readonly refused: readonly QueryIssue[];
};

/** One conjunct of a slice, with its place among those at its address. */
export type PlacedConjunct = {
  readonly predicate: Predicate;
  readonly ref: PredicateRef;
};

/** One conjunct of the filter, read as its own chip. */
export type QueryPredicateClause = {
  readonly kind: "predicate";
  /** `field__operator__nth`: stable while the query keeps its conjuncts. */
  readonly id: string;
  /** The conjunct's place in the query. */
  readonly refs: readonly [PredicateRef];
  readonly predicate: Predicate;
  /** What the operator asserts, as `readCondition` reads it. */
  readonly condition: PredicateCondition;
};

/**
 * A field's one lower and one upper bound, read as one range chip where the
 * lower stands at or below the upper. A grouping of two conjuncts only:
 * the query holds them as two.
 */
export type QueryRangeClause = {
  readonly kind: "range";
  /** `field__range`: a field holds at most one range. */
  readonly id: string;
  readonly field: string;
  /** The lower bound's place, then the upper's. */
  readonly refs: readonly [PredicateRef, PredicateRef];
  /** The `gte` conjunct. */
  readonly lower: Predicate;
  /** The `lte` conjunct. */
  readonly upper: Predicate;
  readonly condition: "range";
};

/** The search text, read as a one-part chip. */
export type QuerySearchClause = {
  readonly kind: "search";
  readonly id: "search";
  /** The search names no conjunct. */
  readonly refs: readonly [];
  readonly search: string;
};

/** A parameter the link carried that was refused, read as an error chip. */
export type QueryRefusedClause = {
  readonly kind: "refused";
  /** `refused__parameter`, then `__k` for the parameter's k-th repeat. */
  readonly id: string;
  /** A refused parameter names no conjunct of the query. */
  readonly refs: readonly [];
  readonly issue: QueryIssue;
};

/**
 * One chip the query reads as. Derived from the query state on every read
 * and never stored.
 */
export type QueryClause =
  | QueryPredicateClause
  | QueryRangeClause
  | QuerySearchClause
  | QueryRefusedClause;

/**
 * Why two or more conjuncts on one field cannot all hold:
 * - `disjoint-options`: a single-valued choice asked to be in sets that
 *   share no option;
 * - `different-text`: a text asked to equal two different texts;
 * - `crossed-bounds`: a lower bound above an upper bound;
 * - `set-and-unset`: a field asked both to hold a value and to hold none.
 */
export type QueryContradictionKind =
  | "disjoint-options"
  | "different-text"
  | "crossed-bounds"
  | "set-and-unset";

/**
 * Conjuncts on one field that cannot all hold, so the query matches
 * nothing. The query still applies; the bar explains the empty result and
 * offers the merge where there is one.
 */
export type QueryContradiction = {
  readonly field: string;
  readonly kind: QueryContradictionKind;
  /** The conjuncts that cannot all hold, in canonical order. */
  readonly refs: readonly PredicateRef[];
  /**
   * The edit that resolves them into what was likely meant: one set of
   * every option asked for, or the two bounds swapped. Null where no one
   * reading stands out.
   */
  readonly merge: PredicateEdit | null;
};
