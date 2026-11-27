import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

export interface ErrorProps {
  /** A unique identifier for the Error. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The error message. */
  children?: Snippet;
}
