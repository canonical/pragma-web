/**
 * The bounded collection grammar: AND-ed filter predicates, text search,
 * ordered sort terms and ordered grouping levels, plus the window those
 * results are read through.
 */

/**
 * Bounded predicate operators.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type PredicateOperator =
  | "isAny"
  | "isNone"
  | "gte"
  | "lte"
  | "isSet"
  | "is"
  | "isNot"
  | "contains"
  | "notContains"
  | "startsWith";

/**
 * A semantic operand value. Field metadata owns coercion; core never guesses.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type PredicateOperand = string | number | boolean | null;

/**
 * One filter clause — a conjunct of the slice's filter — addressed by its
 * field and operator; an address may hold several, and each restricts the
 * result. `isAny` and `isNone` operands are a non-empty set; `isSet` carries
 * one boolean, `true` for a field that holds a value and `false` for one
 * that holds none; every other operator carries exactly one operand.
 * Numbers must be finite.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type Predicate = {
  readonly field: string;
  readonly operator: PredicateOperator;
  readonly operands: readonly PredicateOperand[];
};

/**
 * One conjunct of a slice's filter, by address and place.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type PredicateRef = {
  readonly field: string;
  readonly operator: PredicateOperator;
  /** Zero-based among the conjuncts at this address, in canonical order. */
  readonly nth: number;
};

/**
 * A part of the query `clear` empties: `filter`, every conjunct of the
 * filter, or `search`, the search text.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type QueryClearPath = "filter" | "search";

/**
 * Sort direction of a single ordered term.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type SortDirection = "asc" | "desc";

/**
 * One sort term; term order carries sort precedence and is never reordered.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type SortTerm = {
  readonly field: string;
  readonly direction: SortDirection;
};

/**
 * One grouping level. Levels nest in list order. Nothing executes a group
 * term yet: every source declares grouping unavailable, so a grouped query
 * is refused.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type GroupTerm = {
  readonly field: string;
};

/**
 * The key of one group at each level down to it: `["failed", "eu-west"]` is
 * the `eu-west` group inside the `failed` group.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type GroupPath = readonly PredicateOperand[];

/**
 * The applied collection query: filters, text search, ordering and
 * grouping, independent of renderer presentation and the result window.
 * Query-class throughout: saved with a view, and a difference marks a view
 * modified.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type Slice = {
  /**
   * The conjuncts every row must match, all of them: two on one address
   * both restrict, so `tags` any of `a` and `tags` any of `b` asks for rows
   * holding both. Their order carries no meaning; the canonical form sorts
   * them.
   */
  readonly filter: readonly Predicate[];
  readonly search: string | null;
  readonly sort: readonly SortTerm[];
  /** Ordered grouping levels; empty is ungrouped. */
  readonly group: readonly GroupTerm[];
};

/**
 * The visible portion of a result. Window-class throughout: part of request
 * identity, never part of a saved view, and never a reason a view is
 * modified.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type ResultWindow = {
  /** One-based page over the result set. */
  readonly page: number;
  readonly size: number;
  /**
   * Opaque token of this page's start, as the source handed it back with an
   * earlier page's `cursors`. Null on page one and for offset sources.
   * Cleared whenever `page` or `size` moves without a token of its own, so
   * a token never describes a page it was not minted for.
   */
  readonly cursor: string | null;
  /**
   * Groups whose rows are left out of the page and of `counts.pageable`.
   * Reset when grouping changes, kept across paging and filtering. Nothing
   * collapses while no source declares grouping, so a non-empty value is
   * refused.
   */
  readonly collapsed: readonly GroupPath[];
};

/**
 * Where a collection is: its slice and its window, always adopted together.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type Query = {
  readonly slice: Slice;
  readonly window: ResultWindow;
};

/**
 * The window members `navigateWindow` addresses. `collapsed` moves with
 * `setCollapsed` instead, so paging and collapsing stay separate gestures.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type WindowNavigation = Partial<Omit<ResultWindow, "collapsed">>;

/**
 * An addressed query command: a predicate command names one conjunct by
 * its `nth`, 0 when left out, and `clear` empties whole parts.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type QueryCommand =
  | {
      readonly kind: "setPredicate";
      readonly predicate: Predicate;
      /**
       * The conjunct at the predicate's address it replaces, 0 when left
       * out. Where the address holds none, the 0th is added.
       */
      readonly nth?: number | undefined;
    }
  | {
      readonly kind: "removePredicate";
      readonly field: string;
      readonly operator: PredicateOperator;
      /** The conjunct at the address it removes, 0 when left out. */
      readonly nth?: number | undefined;
    }
  | {
      readonly kind: "editPredicates";
      /**
       * The conjuncts removed, each named as the slice stands before the
       * edit, so removing one never moves the place of another.
       */
      readonly remove: readonly PredicateRef[];
      /** The conjuncts added, beside whatever already stands. */
      readonly add: readonly Predicate[];
    }
  | { readonly kind: "setSearch"; readonly search: string }
  | {
      readonly kind: "clear";
      /**
       * The parts emptied, one or more; repeated or reordered, they name
       * the same clear.
       */
      readonly paths: readonly [QueryClearPath, ...QueryClearPath[]];
    }
  | { readonly kind: "setSort"; readonly sort: readonly SortTerm[] }
  | { readonly kind: "setGroup"; readonly group: readonly GroupTerm[] }
  | {
      readonly kind: "setCollapsed";
      readonly collapsed: readonly GroupPath[];
    }
  | ({ readonly kind: "navigateWindow" } & WindowNavigation);

/**
 * Outcome of applying a query command: accepted change or explicit rejection.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type QueryCommandResult =
  | (Query & {
      readonly status: "accepted";
      /** True when the semantic query changed (dirty comparisons, history). */
      readonly sliceChanged: boolean;
      /** True when the window changed (window is part of request identity). */
      readonly windowChanged: boolean;
    })
  | (Query & {
      readonly status: "rejected";
      readonly reason: string;
    });
