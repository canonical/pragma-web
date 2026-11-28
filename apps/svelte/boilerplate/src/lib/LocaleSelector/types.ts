import type { SvelteHTMLElements } from "svelte/elements";

/** Props for `LocaleSelector`: the native props of the root `<form>`. */
export type LocaleSelectorProps = Omit<
  SvelteHTMLElements["form"],
  "children" | "method" | "action"
>;
