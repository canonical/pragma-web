import type { ComponentProps, ReactNode } from "react";

/** The props of a query entry's input element. */
export type QueryEntryInputProps = ComponentProps<"input">;

/**
 * What a combobox host, such as a query input with suggestions, shares with
 * the query entry it drives.
 *
 * @experimental The contract serves the query bar's combobox and may change.
 */
export type QueryEntryContextValue = {
  /**
   * Merges the host's combobox props, such as its role, its listbox
   * reference and its key handling, into the entry input's own props, and
   * returns the props the input renders.
   */
  getInputProps: (props: QueryEntryInputProps) => QueryEntryInputProps;
};

/**
 * Props for QueryEntryProvider, which renders no element of its own: it only
 * shares the combobox with its children.
 */
export type QueryEntryProviderProps = QueryEntryContextValue & {
  /** The content holding the query entry. */
  children: ReactNode;
};
