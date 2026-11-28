import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/** Props for `ExampleComponent`: its content, plus the native props of the root `<div>`. */
type BaseProps = SvelteHTMLElements["div"];

export interface ExampleComponentProps extends BaseProps {
  /** Child content. */
  children?: Snippet;
}
