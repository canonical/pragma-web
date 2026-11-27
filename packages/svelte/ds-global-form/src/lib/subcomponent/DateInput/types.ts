import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational date input. */
export type DateInputProps = Omit<HTMLInputAttributes, "type" | "value"> & {
  /** Minimum date value (YYYY-MM-DD format). */
  min?: string;
  /** Maximum date value (YYYY-MM-DD format). */
  max?: string;
  /** The current value as an ISO string. Bindable. */
  value?: string;
};
