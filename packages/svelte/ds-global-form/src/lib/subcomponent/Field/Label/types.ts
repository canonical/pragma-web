import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

export interface LabelMessages {
  /** The optional message (e.g. "optional"), shown in parentheses after the label in the "optional" indicator mode. */
  optional: () => string;
}

/**
 * How a field's required/optional state is signalled in the label:
 *  - "required" (default): a marker (default "*") is shown BEFORE the label of
 *    required fields, so the user scans for the marked ones.
 *  - "optional": " (optional)" is shown AFTER the label of optional fields, so
 *    the user scans for the unmarked (required) ones.
 * The two are mutually exclusive conventions — pick one per form.
 */
export type RequiredIndicator = "required" | "optional";

export interface LabelProps {
  /** A unique identifier for the Label. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The label text. Falls back to `name` when omitted. */
  children?: Snippet;
  /** The name of the labelled input. */
  name: string;
  /** The ID of the labelled input; applies when rendered as a `label`. */
  for?: string;
  /** Is the field optional. */
  isOptional?: boolean;
  /** Which convention marks required/optional fields. Default: "required". */
  requiredIndicator?: RequiredIndicator;
  /** Custom messages. */
  messages?: LabelMessages;
  /** The element to render as. Default: "label". */
  tag?: "label" | "legend" | "span";
}
