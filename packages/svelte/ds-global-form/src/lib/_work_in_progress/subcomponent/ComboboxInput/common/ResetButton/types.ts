import type { ClassValue, MouseEventHandler } from "svelte/elements";

export interface ResetButtonMessages {
  /** The accessible name of the button. */
  reset: () => string;
}

export interface ResetButtonProps {
  /** A unique identifier for the ResetButton. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** Custom messages. */
  messages?: ResetButtonMessages;
  /** Clears the selection. */
  onclick: MouseEventHandler<HTMLButtonElement>;
}
