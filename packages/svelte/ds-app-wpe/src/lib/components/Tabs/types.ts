import type { Item } from "@canonical/ds-types";
import type { SvelteHTMLElements } from "svelte/elements";

export type TabItem = Item & {
  class?: string;
};

export interface TabsProps extends Omit<SvelteHTMLElements["nav"], "children"> {
  "aria-label": string;
  navigationRoot: TabItem;
  currentUrl?: string;
  listClass?: string;
}
