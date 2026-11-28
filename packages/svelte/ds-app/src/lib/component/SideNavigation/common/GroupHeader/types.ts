import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type OwnProps = {
  /** Header text, or a snippet rendering it. */
  children?: string | Snippet;
};

export type GroupHeaderProps = OwnProps &
  Omit<SvelteHTMLElements["span"], keyof OwnProps>;
