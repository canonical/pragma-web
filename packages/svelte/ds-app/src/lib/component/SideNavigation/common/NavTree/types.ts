import type { SvelteHTMLElements } from "svelte/elements";
import type { LinkSnippet, NavRoot } from "../../types.js";

type OwnProps = {
  /** Root whose direct children (level-1 groups) are rendered. */
  root: NavRoot;
  /** Live current location; resolves and keeps the active item in sync. */
  currentUrl?: string;
  /** Renders the link of a navigable item. Defaults to a plain `<a>`. */
  link?: LinkSnippet;
};

export type NavTreeProps = OwnProps &
  Omit<SvelteHTMLElements["div"], keyof OwnProps | "children">;
