import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/*
 * The side navigation's data, with the shape of `@canonical/react-ds-app`'s
 * `NavRoot` and `FooterRoot`, so the tree that feeds the stand-in side
 * navigation feeds the Svelte `SideNavigation` unchanged once it ships.
 */

/** A navigable row: a link, or, when `disabled` or without a `url`, plain text. */
export interface LeafNavItem {
  /** Identity of an item without a `url`. */
  readonly key?: string;
  readonly url?: string;
  readonly label?: string;
  /** Rendered without a link, so nothing leads to a missing page. */
  readonly disabled?: boolean;
  /** The name of a `@canonical/ds-assets` icon. */
  readonly icon?: string;
}

/** A row that discloses one level of leaf items. */
export type ExpandableNavItem = Omit<LeafNavItem, "url"> & {
  readonly items: readonly LeafNavItem[];
};

export type NavItem = LeafNavItem | ExpandableNavItem;

/** A named collection of items, with an optional header. */
export interface NavGroup {
  readonly key: string;
  readonly label?: string;
  readonly items?: readonly NavItem[];
}

/** The side navigation's tree: groups of items. */
export interface NavRoot {
  readonly key: string;
  readonly items?: readonly NavGroup[];
}

/** A footer row. */
export interface FooterItem {
  readonly label: string;
  readonly icon?: string;
  readonly url?: string;
}

/** The side navigation's footer rows. */
export interface FooterRoot {
  readonly key: string;
  readonly items?: readonly FooterItem[];
}

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
