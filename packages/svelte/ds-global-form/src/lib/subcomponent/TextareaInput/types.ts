import type { HTMLTextareaAttributes } from "svelte/elements";

/** Props for the presentational Textarea input. */
export type TextareaInputProps = Omit<HTMLTextareaAttributes, "value"> & {
  /** The current value. Bindable. */
  value?: string;
};
