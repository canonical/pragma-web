import type { SvelteHTMLElements } from "svelte/elements";
import type { ThemePreference } from "../ThemeSelector/index.js";

/**
 * Props for `TopBar`. The bar owns its content — the application's name and
 * the demo navigation — so beyond the page it is on it takes only the native
 * props of its root `<header>`, which reach the element unchanged.
 */
export interface TopBarProps
  extends Omit<SvelteHTMLElements["header"], "children"> {
  /** The current page's pathname. */
  currentUrl: string;
  /** The theme preference the page was rendered with. */
  theme: ThemePreference;
}
