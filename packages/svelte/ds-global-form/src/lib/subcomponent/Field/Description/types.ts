import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

export interface DescriptionProps {
  /** A unique identifier for the Description. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The description text. */
  children?: Snippet;
}
