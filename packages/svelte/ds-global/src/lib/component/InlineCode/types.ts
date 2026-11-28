import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = SvelteHTMLElements["code"];

/**
 * Props for the InlineCode component, extending its native `<code>` root.
 *
 * @implements ds:global.component.inline_code
 */
export interface InlineCodeProps extends BaseProps {
  /** The code to render. */
  children?: Snippet;
}
