import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { LeafNavItem, LinkSnippet } from "../../types.js";

/**
 * Props for the default SideNavigation item renderer — a flat leaf row.
 * Spreads the LeafNavItem fields (url, disabled, icon, slot, …) plus
 * presentational extras. Always a leaf: an entry with children is a
 * SideNavigation.ItemExpandable instead.
 */
type OwnProps = Omit<LeafNavItem, "label" | "key" | "class"> & {
  /** Item content: the label text, or a snippet rendering it. */
  children?: string | Snippet;
  /** Whether this item is the active (current) page. */
  active?: boolean;
  /** Renders the link of a navigable item. Defaults to a plain `<a>`. */
  link?: LinkSnippet;
};

export type ItemProps = OwnProps &
  Omit<SvelteHTMLElements["li"], keyof OwnProps>;
