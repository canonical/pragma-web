import type { ClassValue } from "svelte/elements";
import type { Option } from "../../../../../subcomponent/types.js";

/** Attributes and handlers for the listbox, from the combobox builder. */
export type MenuAttributes = {
  id: string;
  role: "listbox";
  "aria-labelledby"?: string;
  onmouseleave?: (event: MouseEvent) => void;
  [key: string | symbol]: unknown;
};

/** Attributes and handlers for one option, from the combobox builder. */
export type ItemAttributes = {
  id: string;
  role: "option";
  "aria-selected": boolean;
  [key: string]: unknown;
};

export type ListProps = {
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The options to list. */
  items: readonly Option[];
  /** The listbox attributes to spread, as the builder's `menu` getter. */
  menu: MenuAttributes;
  /** The attributes of the option at an index, as the builder's `getItem`. */
  getItem: (index: number) => ItemAttributes;
  /** Index of the highlighted option, or -1. */
  highlightedIndex: number;
  /** The text shown for an option. */
  convertItemToString: (item: Option | null) => string;
  /** The selected value or values. */
  fieldValue: string | string[] | undefined;
  /** The key to read an option's value from. */
  valueKey: keyof Option;
  /** Whether the list is shown. */
  isOpen: boolean;
};
