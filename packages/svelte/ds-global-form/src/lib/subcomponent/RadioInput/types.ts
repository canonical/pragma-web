import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational Radio input. */
export type RadioInputProps = Omit<HTMLInputAttributes, "type"> & {
  /** Whether the radio is selected. Bindable. */
  checked?: boolean;
};
