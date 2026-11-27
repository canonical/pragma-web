import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational Range input. */
export type RangeInputProps = Omit<HTMLInputAttributes, "value"> & {
  /** Minimum value (also used for `aria-valuemin`). */
  min: number;
  /** Maximum value (also used for `aria-valuemax`). */
  max: number;
  /** The current value, shown in the output. Bindable. */
  value?: number;
};
