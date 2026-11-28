import type { SvelteHTMLElements } from "svelte/elements";
import type { ThemePreference } from "../ThemeSelector/index.js";

/**
 * Props for `Navigation`: the page's pathname and the theme it was rendered
 * with, plus the native props of the root `<nav>`.
 */
export interface NavigationProps
  extends Omit<SvelteHTMLElements["nav"], "children"> {
  /** The current page's pathname; its link is marked as the current page. */
  currentUrl: string;
  /** The theme preference the page was rendered with. */
  theme: ThemePreference;
}
