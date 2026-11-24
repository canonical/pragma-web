import type { ComponentProps } from "react";
import type { GetEntryProps } from "../types.js";

/** The entry's props: its input's own, and how the combobox reaches it. */
export type EntryProps = ComponentProps<"input"> & {
  /** Whether scripts have run. */
  isMounted: boolean;
  /** Merges the combobox props into the input's own. */
  getEntryProps: GetEntryProps;
};
