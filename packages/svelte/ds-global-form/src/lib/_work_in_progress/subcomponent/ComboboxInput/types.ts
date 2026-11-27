import type { ClassValue } from "svelte/elements";
import type { Option, OptionsProps } from "../../../subcomponent/types.js";

/** Props for the presentational Combobox. */
export type ComboboxInputProps = OptionsProps & {
  /** A unique identifier for the combobox. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** The selected value, or values with `isMultiple`. Bindable. */
  value?: string | string[];
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Placeholder of the text input. */
  placeholder?: string;
  /** Open the list after the selection is reset. */
  openOnReset?: boolean;
  /** Allow several selections, rendered as chips. */
  isMultiple?: boolean;
  /** Filters the options for the typed text. */
  filterItems?: (options: readonly Option[], inputValue: string) => Option[];
  /** Called when the text input loses focus. */
  onblur?: () => void;
};
