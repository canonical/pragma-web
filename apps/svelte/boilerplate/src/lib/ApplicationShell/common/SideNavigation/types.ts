import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { FooterRoot, NavRoot } from "../../types.js";

/** The side navigation's built-in text, as React's `SideNavigation` takes it. */
export interface SideNavigationMessages {
  readonly skipToContent: () => string;
}

/**
 * Props for the stand-in side navigation: the subset of React's
 * `SideNavigation` props the shell passes, plus the native props of its root
 * `<div>`.
 */
export interface SideNavigationProps
  extends Omit<SvelteHTMLElements["div"], "children"> {
  /** The accessible name of the navigation landmark. */
  "aria-label": string;
  /** The application's name, shown beside the brand. */
  applicationName: string;
  /** The brand mark, linking home. */
  brand?: Snippet;
  /** The current page's pathname. */
  currentUrl: string;
  root: NavRoot;
  footerRoot?: FooterRoot;
  messages: SideNavigationMessages;
}
