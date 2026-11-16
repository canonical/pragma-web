import type {
  Predicate,
  PredicateCondition,
  PredicateEdit,
  PredicateOperand,
  PredicateOperator,
  PredicateRef,
  Query,
  QueryClearPath,
  QueryIssue,
  ReadonlyChannel,
  RecordNoun,
  SourceRefusal,
} from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

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

/**
 * A symbol a reader types for an operator. A widened one asks for less
 * than it says: `>` reads as at least, since bounds are never strict, and
 * the bar says so.
 */
export type TypedSymbol = {
  readonly symbol: string;
  readonly widened: boolean;
};

/** The operator a typed symbol reads as on a field, and whether widened. */
export type TypedSymbolReading = {
  readonly operator: PredicateOperator;
  readonly widened: boolean;
};

/** What `spellHref` spells: a query, and the view open beside it. */
export type QueryDestinationStandIn = Query & {
  readonly view?: string | null;
};

/**
 * The store's query group, as the bar reads and writes it: the query
 * state, and the commands that move it, each answering with the refusals
 * of the query it would make, empty when applied. It stands in for
 * `store.query` until the store lands, with the same members.
 */
export type QueryGroupStandIn = {
  /** The query state, at one identity until the query, view or refusals move. */
  readonly state: ReadonlyChannel<QueryStateStandIn>;
  readonly setSearch: (search: string) => readonly SourceRefusal[];
  readonly setPredicate: (
    predicate: Predicate,
    nth?: number,
  ) => readonly SourceRefusal[];
  readonly addPredicate: (predicate: Predicate) => readonly SourceRefusal[];
  readonly removePredicate: (ref: PredicateRef) => readonly SourceRefusal[];
  readonly editPredicates: (edit: PredicateEdit) => readonly SourceRefusal[];
  /** Empty the named parts of the query in one commit. */
  readonly clear: (
    paths: readonly [QueryClearPath, ...QueryClearPath[]],
  ) => readonly SourceRefusal[];
  /** Every refusal a query would incur; empty means it can run. */
  readonly listRefusals: (query: Query) => readonly SourceRefusal[];
  /** A destination as the location's address, or null without one. */
  readonly spellHref: (destination: QueryDestinationStandIn) => string | null;
};

/**
 * The words the bar names the collection's data by: each field's label,
 * and what its records are called. It stands in for the labels the root
 * will hand its parts.
 */
export type QueryBarLabelsStandIn = {
  readonly readFieldLabel: (field: string) => string;
  readonly recordNoun: RecordNoun;
};

/** A part of a clause the chip's Entry can take. */
export type QueryBarPart = "field" | "operator" | "value" | "search";

/**
 * A clause being built or edited: the session's own, never a copy of what
 * applies. It stands in its chip while the chip holds an Entry.
 */
export type QueryBarDraft =
  | {
      readonly kind: "predicate";
      /** The applied clause being edited, or null while one is built. */
      readonly origin: {
        readonly id: string;
        readonly ref: PredicateRef;
        /** The conjunct as it applied when the edit opened. */
        readonly held: Predicate;
      } | null;
      readonly field: string;
      /** Null until one is chosen. */
      readonly operator: PredicateOperator | null;
      /** The values chosen so far. */
      readonly operands: readonly PredicateOperand[];
    }
  | {
      readonly kind: "search";
      readonly origin: { readonly id: string; readonly ref: null };
      /** The search as it applies. */
      readonly text: string;
    };

/** The query bar's edit session, the one state the bar keeps of its own. */
export type QueryBarSession = {
  /** What is typed in the free-text entry. */
  readonly text: string;
  /** The clause in its chip's Entry, or null while none holds one. */
  readonly draft: QueryBarDraft | null;
  /** The part the Entry takes; null while no chip holds one. */
  readonly part: QueryBarPart | null;
  /** What is typed in the chip's Entry. */
  readonly typed: string;
  /** Why the typed value cannot be read, once a commit tried it. */
  readonly invalid: string | null;
  /** The roving item that holds the toolbar's stop. */
  readonly activeItem: string;
  /** The Segment that takes focus once the stop rests on its chip. */
  readonly focus: {
    readonly item: string;
    readonly part: QueryBarPart;
  } | null;
};

/** Everything that moves the edit session. */
export type QueryBarSessionAction =
  | { readonly type: "typeText"; readonly text: string }
  | { readonly type: "typePart"; readonly text: string }
  | {
      readonly type: "edit";
      readonly draft: QueryBarDraft;
      readonly part: QueryBarPart;
      readonly typed: string;
    }
  | { readonly type: "invalid"; readonly reason: string }
  | {
      readonly type: "close";
      readonly item: string;
      readonly focus: QueryBarPart | null;
    }
  | { readonly type: "moveStop"; readonly item: string }
  | { readonly type: "focused" };

/** The query bar's own props. */
type OwnProps = {
  /** The field's name; the messages' `queryBar` by default. */
  readonly label?: string;
  /** The fields shown as quick filters beside the field; each must be in the schema. */
  readonly quickFilters?: readonly string[];
};

/**
 * Props of the connected query bar. The rest reach its root `div`, apart
 * from `children`, which the bar renders itself, and `role`. It reads the
 * store, its schema and its messages from the enclosing root, so it takes
 * none of them.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsQueryBarProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children" | "role">;
