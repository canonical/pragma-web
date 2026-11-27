import type { HTMLInputAttributes } from "svelte/elements";

/** Props for the presentational Password input. */
export type PasswordInputProps = Omit<
  HTMLInputAttributes,
  "type" | "prefix" | "value"
> & {
  /** Whether the reveal/mask (eye) toggle is offered. Defaults to `true`. */
  revealable?: boolean;
  /** Accessible label for the toggle while the value is masked. */
  revealLabel?: string;
  /** Accessible label for the toggle while the value is revealed. */
  maskLabel?: string;
  /** The current value. Bindable. */
  value?: string;
};
