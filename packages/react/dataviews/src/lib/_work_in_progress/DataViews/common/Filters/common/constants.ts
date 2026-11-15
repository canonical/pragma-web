import type {
  Count,
  DataViewsMessages,
  PredicateOperator,
} from "@canonical/dataviews-core";

/** The count of a value no matching record holds. */
export const NO_RECORDS: Count = Object.freeze({ kind: "exact", value: 0 });

/**
 * The message each operator's control reads by, by the field's label, or
 * null for presence, whose control reads as the label alone: the one table
 * every Filters control names an operator by.
 */
export const PHRASE_MESSAGES = Object.freeze({
  isAny: "filterIsAnyOf",
  isNone: "filterIsNoneOf",
  gte: "filterFrom",
  lte: "filterTo",
  is: "filterIs",
  isNot: "filterIsNot",
  contains: "filterContains",
  notContains: "filterNotContains",
  startsWith: "filterStartsWith",
  endsWith: "filterEndsWith",
  isSet: null,
} as const satisfies Readonly<
  Record<PredicateOperator, keyof DataViewsMessages | null>
>);
