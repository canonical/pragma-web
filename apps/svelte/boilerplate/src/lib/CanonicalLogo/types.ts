import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for `CanonicalLogo`. The logo owns its link target, its accessible
 * name and its mark, so it takes the page it is on and the native props of
 * its root `<a>`, which reach the element unchanged.
 */
export interface CanonicalLogoProps
  extends Omit<
    SvelteHTMLElements["a"],
    "aria-label" | "children" | "href" | "aria-current"
  > {
  /** The current page's pathname; on the overview the logo is the current page. */
  currentUrl: string;
}
