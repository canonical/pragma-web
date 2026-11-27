import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational time input. */
export type TimeInputProps = Omit<HTMLInputAttributes, "type" | "value"> & {
  /** Minimum time value (HH:MM format). */
  min?: string;
  /** Maximum time value (HH:MM format). */
  max?: string;
  /** Step interval in seconds. */
  step?: number;
  /** The current value as an ISO string. Bindable. */
  value?: string;
};
