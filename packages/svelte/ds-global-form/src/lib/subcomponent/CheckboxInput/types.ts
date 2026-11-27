import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational Checkbox input. */
export type CheckboxInputProps = Omit<HTMLInputAttributes, "type"> & {
  /** Whether the checkbox is checked. Bindable. */
  checked?: boolean;
};
