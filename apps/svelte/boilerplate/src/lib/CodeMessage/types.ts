import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for `CodeMessage`: the message, plus the native props of the root
 * `<p>`, which reach the element unchanged.
 */
export interface CodeMessageProps
  extends Omit<SvelteHTMLElements["p"], "children"> {
  /**
   * A translated message, with code names between backticks, e.g.
   * "`LazyComponent` awaits a delayed fetch".
   */
  message: string;
}
