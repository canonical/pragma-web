import type { _DistributiveOmit, Item } from "@canonical/ds-types";
import type { SvelteHTMLElements } from "svelte/elements";

export type TabItem = _DistributiveOmit<Item, "items"> & {
  /** Additional CSS class applied to this item's `<li>`. */
  class?: string;
  /** Child navigation items using the same Tabs-specific fields. */
  items?: TabItem[];
};

/** Props for the Tabs navigation component. */
export interface TabsProps extends Omit<SvelteHTMLElements["nav"], "children"> {
  /** Accessible label for the navigation landmark. */
  "aria-label": string;
  /** Navigation root whose immediate children are rendered as section links. */
  navigationRoot: TabItem;
  /** URL matched exactly against each item's URL to mark the current page. */
  currentUrl?: string;
  /** Additional CSS class applied to the navigation list. */
  listClass?: string;
}
