/**
 * The names of the flat, form-compatible wire grammar: the delimiter
 * between a field, its operator and a conjunct's ordinal, the parameters
 * the grammar writes and reserves, and the operators written with the
 * delimiter.
 */

import { OPERATOR_ARITY, type PredicateOperator } from "../query/index.js";
import type { ArrangementKeyPart } from "./types.js";

/**
 * The delimiter between a field's wire name and its operator, and between
 * the operator and a conjunct's ordinal: `tags__isAny__1` is the second
 * conjunct on `tags` under `isAny`. A field's wire name never holds it, so
 * the three segments cannot be confused.
 */
export const OPERATOR_DELIMITER = "__";

/**
 * The parameter each written member of a query is spelled under: the
 * search, the ordering, the grouping, and the window's page, size and
 * cursor. Named once, so every reader and writer of the grammar spells
 * them alike.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export const QUERY_KEYS = Object.freeze({
  search: "q",
  sort: "sort",
  group: "group",
  page: "page",
  size: "size",
  cursor: "cursor",
} as const);

/**
 * The parameters the grammar writes for every collection. Collapse is
 * window-class but has no spelling: a reload expands every group.
 */
export const WRITTEN_QUERY_KEYS: readonly string[] = Object.freeze(
  Object.values(QUERY_KEYS),
);

/**
 * The annotation naming the saved view a location has open. It asks the source
 * for nothing and never marks the view modified; the grammar reserves it, and
 * `readOpenView` reads it.
 */
export const VIEW_KEY = "view";

/**
 * The prefix of the parameters a table's arrangement is carried in where no
 * script keeps it: `table.<id>.order` and `table.<id>.hidden`, as the
 * presentation keys they carry.
 */
export const ARRANGEMENT_QUERY_PREFIX = "table.";

/** The prefix as a pattern's source. */
export const ARRANGEMENT_QUERY_SOURCE = ARRANGEMENT_QUERY_PREFIX.replaceAll(
  ".",
  "\\.",
);

/** The parts a table keeps, which no spelled id may read as. */
export const ARRANGEMENT_KEY_PARTS: readonly ArrangementKeyPart[] =
  Object.freeze(["order", "hidden", "width"]);

/** A spelled table id: any id, encoded so it holds no dot and names no part. */
export const TABLE_ID_SOURCE = `(?!(?:${ARRANGEMENT_KEY_PARTS.join("|")})\\.)[^.]+`;

/** A parameter carrying one table's order or hidden columns, and its parts. */
export const ARRANGEMENT_QUERY_PATTERN = new RegExp(
  `^${ARRANGEMENT_QUERY_SOURCE}(${TABLE_ID_SOURCE})\\.(order|hidden)$`,
);

/**
 * Parameter names the grammar reserves: those it writes, plus the
 * annotation names it leaves to the host. A field's wire name may not
 * collide with one — the query would be ambiguous.
 */
export const RESERVED_QUERY_KEYS: readonly string[] = Object.freeze([
  ...WRITTEN_QUERY_KEYS,
  VIEW_KEY,
  "item",
]);

/**
 * The operators a key may carry after the delimiter: every operator, read
 * off the one exhaustive arity table, so an operator added to the grammar
 * is spelled on the wire without a second list to keep. `isAny` is written
 * as the bare field name, and read under both spellings as one predicate.
 */
export const SUFFIXED_OPERATORS: readonly PredicateOperator[] = Object.freeze(
  // The table is keyed by every operator, and by nothing else.
  Object.keys(OPERATOR_ARITY) as PredicateOperator[],
);

/**
 * The values a presence key reads as: `true` and `false`, and `1`, which
 * links spelled before presence took a boolean carry, as `true`.
 */
export const PRESENCE_VALUES = Object.freeze({
  true: true,
  false: false,
  "1": true,
} as const);
