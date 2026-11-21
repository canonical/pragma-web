/** How many lines a list's row may take, by name. */
export const LIST_LINES = ["one", "two"] as const;

/** The `aria-sort` value of a column, by the order it sorts the list in. */
export const ARIA_SORT = {
  ascending: "ascending",
  descending: "descending",
} as const;

/** The icon that marks a sorted column's direction, by its `aria-sort`. */
export const SORT_DIRECTION_ICON = {
  ascending: "arrow-up",
  descending: "arrow-down",
} as const;

/**
 * The class a title cell's link takes, which the table draws as its text:
 * the list that builds the rows gives it to the link it puts in the cell.
 */
export const TITLE_LINK_CLASS_NAME = "link";

/**
 * How many value cells a row keeps below two groups, where it folds into a
 * scented row: the title's line, then these values, each after its label.
 */
export const FOLDED_VALUE_COUNT = 2;
