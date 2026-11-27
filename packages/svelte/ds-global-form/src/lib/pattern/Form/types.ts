import type { Snippet } from "svelte";
import type { HTMLFormAttributes } from "svelte/elements";

/**
 * Props for the Form shell. Native form attributes (`method`, `action`, …),
 * handlers and attachments are passed through to the `<form>`.
 */
export type FormProps = HTMLFormAttributes & {
  /** The fields of the form. */
  children?: Snippet;
};
