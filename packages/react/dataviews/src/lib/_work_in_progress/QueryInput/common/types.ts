import type { UseComboboxPropGetters } from "downshift";
import type { QueryEntryInputProps } from "../../../common/QueryEntry/index.js";

/**
 * One suggestion.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type QueryInputOption = {
  /** The option's id, which `onOptionSelect` receives. */
  id: string;
  /** The text shown. */
  label: string;
  /** The spoken name when it differs from the label. */
  name?: string | undefined;
  /** A hint after the label, such as a count, read as part of the name. */
  hint?: string | undefined;
  /** Shown but never chosen. */
  disabled?: boolean | undefined;
  /** The option already held: shown bold and never chosen. */
  current?: boolean | undefined;
  /** Consecutive options with different groups are divided by a line. */
  group?: string | undefined;
};

/** Which entry an input is: QueryInput's own, or a chip's. */
export type EntryKind = "own" | "chip";

/** downshift's listbox props. */
export type GetMenuProps =
  UseComboboxPropGetters<QueryInputOption>["getMenuProps"];

/** downshift's option props. */
export type GetItemProps =
  UseComboboxPropGetters<QueryInputOption>["getItemProps"];

/**
 * Merges the combobox props into an entry input's own: downshift's for the
 * entry that has focus, a collapsed combobox for the other.
 */
export type GetEntryProps = (
  entry: EntryKind,
  props: QueryEntryInputProps,
) => QueryEntryInputProps;
