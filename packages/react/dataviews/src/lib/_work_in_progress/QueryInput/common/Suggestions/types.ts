import type { GetItemProps, GetMenuProps, QueryInputOption } from "../types.js";

/** The suggestions' props: the list state, and what it shows. */
export type SuggestionsProps = {
  /** Whether the suggestions show. */
  isOpen: boolean;
  /** The CSS anchor name the focused entry carries. */
  anchorName: string;
  /** The footer hint's id. */
  footerId: string;
  /** downshift's listbox props. */
  getMenuProps: GetMenuProps;
  /** downshift's option props. */
  getItemProps: GetItemProps;
  /** The listbox's accessible name. */
  label: string;
  /** The options, in order. */
  options: QueryInputOption[];
  /** Shows the spinner. */
  loading: boolean;
  /** Shown when there are no options. */
  emptyText?: string | undefined;
  /** A hint at the foot of the list. */
  footer?: string | undefined;
};
