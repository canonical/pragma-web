import type { QueryChipFault } from "../types.js";

/**
 * QueryChip.Entry's props. Its root wraps the input, whose props come from
 * these and from the combobox host, so an entry takes no native props.
 */
export type EntryProps = {
  /** What has been typed. */
  value: string;
  /** Called with the new text on every change. */
  onValueChange: (value: string) => void;
  /** The input's accessible name, such as "Value for status". */
  label: string;
  /** Shown while nothing is typed. */
  placeholder?: string;
  /** The shape of what remains to be typed, shown after the input as a hint. */
  template?: string;
  /** Text that follows the value, such as a unit, read with the input. */
  suffix?: string;
} & QueryChipFault;
