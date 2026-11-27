import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational Hidden input. */
export type HiddenInputProps = Omit<HTMLInputAttributes, "type" | "value"> & {
  /** The submitted value. Bindable. */
  value?: string | number;
};
