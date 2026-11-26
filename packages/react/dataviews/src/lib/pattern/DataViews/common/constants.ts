import type { Count, DataViewsMessages } from "@canonical/dataviews-core";

/** The count of a value no matching record holds. */
export const NO_RECORDS: Count = Object.freeze({ kind: "exact", value: 0 });

/**
 * The three presence choices, in order: no restriction, records that hold
 * a value, records that hold none. Each with the operand it applies, null
 * for none.
 */
export const PRESENCE_CHOICES = [
  { applied: null, message: "presenceAny" },
  { applied: true, message: "presenceSet" },
  { applied: false, message: "presenceUnset" },
] as const satisfies readonly {
  readonly applied: boolean | null;
  readonly message: keyof DataViewsMessages;
}[];

/** The other set operator, which a standing set may move to. */
export const ALTERNATIVE_SET_OPERATOR = {
  isAny: "isNone",
  isNone: "isAny",
} as const;

/** The message naming the control that moves a set to each operator. */
export const SET_OPERATOR_SWITCH_MESSAGES = {
  isAny: "matchAnyInstead",
  isNone: "matchNoneInstead",
} as const satisfies Readonly<
  Record<"isAny" | "isNone", keyof DataViewsMessages>
>;
