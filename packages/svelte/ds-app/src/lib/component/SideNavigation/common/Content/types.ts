import type { SvelteHTMLElements } from "svelte/elements";
import type { LinkSnippet, NavRoot } from "../../types.js";
import type { ContextSwitcherProps } from "../ContextSwitcher/types.js";

type OwnProps = {
  /** Root whose direct children render as groups — see NavRoot. */
  root?: NavRoot;
  /** The context switcher, rendered before the `<nav>` landmark. Omitted renders none. */
  contextSwitcher?: ContextSwitcherProps;
  /** Renders the link of a navigable item. Defaults to a plain `<a>`. */
  link?: LinkSnippet;
  /** Live current location; resolves and keeps the active item in sync. */
  currentUrl?: string;
  /** The `<nav>` landmark's name. */
  "aria-label"?: string;
};

/** The native attributes go to the region's root `<div>`; `aria-label` to the `<nav>`. */
export type ContentProps = OwnProps &
  Omit<SvelteHTMLElements["div"], keyof OwnProps | "children">;
