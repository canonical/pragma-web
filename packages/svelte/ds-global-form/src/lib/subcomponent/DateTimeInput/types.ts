import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational datetime-local input. */
export type DateTimeInputProps = Omit<HTMLInputAttributes, "type" | "value"> & {
  /** Minimum datetime value (YYYY-MM-DDTHH:MM format). */
  min?: string;
  /** Maximum datetime value (YYYY-MM-DDTHH:MM format). */
  max?: string;
  /** Step interval in seconds. */
  step?: number;
  /** The current value as an ISO string. Bindable. */
  value?: string;
};
