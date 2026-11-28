import type { AriaAttributes, ClassValue } from "svelte/elements";
import type { Option, OptionsProps } from "../../../subcomponent/types.js";

/**
 * Resolves a value to its option. It may answer at once or through a promise,
 * for example to fetch the label of a value that is not in `options`.
 */
export type ConvertValueToItem = (
  value: string,
  items: readonly Option[],
  valueKey: keyof Option,
) => Option | null | Promise<Option | null>;

/**
 * The accessibility wiring of the text input. The field tier supplies the
 * label, description and error references; standalone, `aria-label` or
 * `aria-labelledby` names the combobox. Its name also names the list.
 */
type InputAriaProps = Pick<
  AriaAttributes,
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-errormessage"
  | "aria-invalid"
  | "aria-required"
>;

/** Props for the presentational Combobox. */
export type ComboboxInputProps = OptionsProps &
  InputAriaProps & {
    /** The ID of the text input, so a `<label for>` reaches it. */
    id?: string;
    /** Additional CSS classes. */
    class?: ClassValue;
    /** Inline styles. */
    style?: string;
    /**
     * Name of the hidden input that carries each selected value, so the value
     * posts in a plain HTML submission. The visible text input stays unnamed.
     */
    name?: string;
    /** The selected value, or values with `isMultiple`. Bindable. */
    value?: string | string[];
    /** The typed text. Bindable, so the app can compute `options` from it. */
    inputValue?: string;
    /** Whether the input is disabled. */
    disabled?: boolean;
    /** Placeholder of the text input. */
    placeholder?: string;
    /** The option key a value is read from. */
    valueKey?: keyof Option;
    /** Open the list after the selection is reset. */
    openOnReset?: boolean;
    /** Allow several selections, rendered as chips. */
    isMultiple?: boolean;
    /** Filters the options for the typed text. */
    filterItems?: (options: readonly Option[], inputValue: string) => Option[];
    /** The text shown for an option. */
    convertItemToString?: (item: Option | null) => string;
    /**
     * Resolves the value to its option. The default looks it up in `options`
     * synchronously, so a server render shows the selection at once. While a
     * returned promise is pending nothing is shown as selected; if the value
     * changes meanwhile, the stale answer is discarded.
     */
    convertValueToItem?: ConvertValueToItem;
    /** Called when the text input loses focus. */
    onblur?: (event: FocusEvent) => void;
  };
