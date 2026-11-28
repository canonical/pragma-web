import type { SvelteHTMLElements } from "svelte/elements";
import type { FooterRoot, LinkSnippet } from "../../types.js";

type OwnProps = {
  /** The footer's items — the footer's only data surface. See FooterRoot. */
  root?: FooterRoot;
  /** Renders the link of a navigable item. Defaults to a plain `<a>`. */
  link?: LinkSnippet;
  /** Live current location; resolves the active row and seeds expandables. */
  currentUrl?: string;
};

export type FooterProps = OwnProps &
  Omit<SvelteHTMLElements["footer"], keyof OwnProps | "children">;
