/* @canonical/generator-ds 0.9.0-experimental.9 */
import type {
  BaseProps,
  Option,
  OptionsProps,
} from "../../../subcomponent/types.js";
import type * as utils from "./utils/index.js";

/**
 * Resolves a value to its option. It may answer at once or through a promise,
 * for example to fetch the label of a value that is not in `options`.
 */
export type ConvertValueToItem = (
  value: string,
  items: Option[],
  valueKey: keyof Option,
) => Option | null | Promise<Option | null>;

/** Controlled value props — supplied by the field tier, or directly when standalone. */
type ControlledProps = {
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  onBlur?: () => void;
};

type CommonProps = {
  /**
   * Name of the hidden input that carries each selected value, so the value
   * posts in a plain HTML submission. The visible text input stays unnamed.
   */
  name?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  placeholder?: string;

  valueKey?: keyof Option;

  openOnReset?: boolean;

  /** When enabled, allows selecting multiple values (rendered as chips). */
  isMultiple?: boolean;

  filterItems?: (options: Option[], inputValue: string) => Option[];

  convertItemToString?: typeof utils.convertItemToString;

  /**
   * Resolves the controlled value to its option. The default looks it up in
   * `options` synchronously, so a server render shows the selection at once.
   * While a returned promise is pending nothing is shown as selected; if the
   * value changes meanwhile, the stale answer is discarded.
   */
  convertValueToItem?: ConvertValueToItem;

  onInputValueChangeFactory?: (
    setItems: React.Dispatch<React.SetStateAction<Option[]>>,
  ) => ({ inputValue }: { inputValue: string }) => void;
};

/** Props for the presentational Combobox (controlled, no react-hook-form). */
export type ComboboxInputProps = BaseProps &
  OptionsProps &
  CommonProps &
  ControlledProps;
