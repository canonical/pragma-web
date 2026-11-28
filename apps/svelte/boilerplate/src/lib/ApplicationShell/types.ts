import type { FooterRoot, NavRoot } from "@canonical/svelte-ds-app";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for `ApplicationShell`: the side navigation's data, the page it is on
 * and the page content, plus the native props of the root `<div>`, which
 * reach the element unchanged.
 */
type BaseProps = SvelteHTMLElements["div"];

export interface ApplicationShellProps extends BaseProps {
  /** The side navigation's tree: groups of items, each item with a `url`. */
  root: NavRoot;
  /** The side navigation's footer rows. Omit it to hide the footer. */
  footerRoot?: FooterRoot;
  /** The accessible name of the side navigation's landmark. */
  label: string;
  /** The current page's pathname; its item is marked as the current page. */
  currentUrl: string;
  /** The page, rendered in the shell's `<main>`. */
  children?: Snippet;
}
