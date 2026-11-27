import type { ClassValue } from "svelte/elements";
import type { Option } from "../../../../../subcomponent/types.js";

export type ListProps = {
  /** The listbox ID, referenced by the combobox input. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The options to list. */
  items: readonly Option[];
  /** Index of the highlighted option, or -1. */
  highlightedIndex: number;
  /** The selected value or values. */
  fieldValue: string | string[] | undefined;
  /** Whether the list is shown. */
  isOpen: boolean;
  /** Called with the option the user picks. */
  onselect?: (item: Option) => void;
};
