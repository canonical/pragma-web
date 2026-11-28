import type { IconName } from "@canonical/ds-assets";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type OwnProps = {
  /** The row's label in the `<summary>`: text, or a snippet rendering it. */
  heading?: string | Snippet;
  /** Leading icon (start slot), by ds-assets icon name. */
  icon?: IconName;
  /** Whether the item (and its disclosure) is interactive. */
  disabled?: boolean;
  /**
   * Initial open state. Defaults to `false`. Seed from whether the active
   * item is among this item's children so the current page's ancestor chain
   * starts expanded. Live in one direction: turning `true` re-opens the
   * disclosure; turning `false` never closes it.
   */
  defaultExpanded?: boolean;
  /**
   * Whether activating a child link or button collapses the disclosure —
   * Footer behaviour. The content tree does not opt in; its branch stays
   * open so the active row remains visible. Defaults to `false`.
   */
  collapseOnChildClick?: boolean;
  /** The disclosed children — typically a list of SideNavigation.Item. */
  children?: Snippet;
};

export type ItemExpandableProps = OwnProps &
  Omit<SvelteHTMLElements["li"], keyof OwnProps>;
