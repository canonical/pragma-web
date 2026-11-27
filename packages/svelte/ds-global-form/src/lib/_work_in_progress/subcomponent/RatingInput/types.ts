import type { ClassValue } from "svelte/elements";

/** The number of stars offered. Ratings are conventionally out of 5 or 10. */
export type RatingScale = 5 | 10;

/**
 * Props for the presentational RatingInput: a radio group of stars, so it
 * inherits native keyboard support and announcements.
 */
export interface RatingInputProps {
  /** A unique identifier for the group; per-star IDs derive from it. */
  id?: string;
  /** Additional CSS classes on the group wrapper. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The radio group name, shared by every star. */
  name: string;
  /** How many stars to offer. Default: 5. */
  count?: RatingScale;
  /** Allow half-star ratings. Default: false. */
  allowHalf?: boolean;
  /** The selected rating: 1..count, in half steps with `allowHalf`. Bindable. */
  value?: number;
  /** Disables the whole group. */
  disabled?: boolean;
  /** Accessible name for the group. Falls back to "Rating". */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** How each star is named to assistive technology. */
  formatStarLabel?: (value: number, count: number) => string;
}
