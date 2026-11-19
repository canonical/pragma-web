/** How many lines a list's row may take, by name. */
export const LIST_LINES = ["one", "two"] as const;

/** The `aria-sort` value of a column, by the order it sorts the list in. */
export const ARIA_SORT = {
  ascending: "ascending",
  descending: "descending",
} as const;
