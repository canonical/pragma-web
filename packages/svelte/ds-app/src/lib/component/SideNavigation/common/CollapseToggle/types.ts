import type { SvelteHTMLElements } from "svelte/elements";

/**
 * The collapse toggle's text, one function per string, so an application can
 * supply translations. Each defaults to its English text.
 */
export interface CollapseToggleMessages {
  /** The button's accessible name while the rail is expanded. */
  collapseNavigation: () => string;
  /** The button's accessible name while the rail is collapsed. */
  expandNavigation: () => string;
  /** The tooltip naming the action while the rail is expanded. */
  collapse: () => string;
  /** The tooltip naming the action while the rail is collapsed. */
  expand: () => string;
  /** The button's visible text below the small breakpoint, menu closed. */
  openMenu: () => string;
  /** The button's visible text below the small breakpoint, menu open. */
  closeMenu: () => string;
}

type OwnProps = {
  /**
   * Whether the navigation is currently expanded. Drives `aria-expanded` and
   * the default `aria-label`. Controlled by the parent SideNavigation.
   */
  expanded?: boolean;
  /** The toggle's text. Any message left out keeps its English default. */
  messages?: Partial<CollapseToggleMessages>;
};

/**
 * `type` is excluded in addition to `OwnProps`: this is always a disclosure
 * trigger, never a form submit/reset control, so it is fixed to `"button"`.
 */
export type CollapseToggleProps = OwnProps &
  Omit<SvelteHTMLElements["button"], keyof OwnProps | "type" | "children">;
