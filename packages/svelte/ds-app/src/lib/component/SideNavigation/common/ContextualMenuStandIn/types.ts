import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/** A selectable row, identified by its `key`. */
export interface StandInItem {
  key: string;
}

/** A divider between sections. */
export interface StandInSeparator {
  type: "separator";
  key: string;
}

export type StandInEntry = StandInItem | StandInSeparator;

type OwnProps = {
  /** The menu's rows and separators, in order. */
  items: StandInEntry[];
  /** Called with the selected row's `key`; the menu then closes. */
  onselect?: (key: string) => void;
  /** Whether the menu is open. Bindable. */
  open?: boolean;
  /** Called when the menu opens or closes. */
  onopenchange?: (open: boolean) => void;
  /** CSS `max-width` of the menu surface. */
  maxWidth?: string;
  /** Renders a row's content inside its `role="menuitem"` element. */
  row: Snippet<[key: string]>;
  /** The trigger button's content. */
  children?: Snippet;
};

export type ContextualMenuStandInProps = OwnProps &
  Omit<SvelteHTMLElements["div"], keyof OwnProps>;
