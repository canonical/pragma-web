import type { NumberInputProps } from "../../../../subcomponent/NumberInput/types.js";

/**
 * Props for the presentational Range control: a canonical number input with a
 * slider that mirrors it.
 */
export type RangeControlProps = Omit<NumberInputProps, "min" | "max"> & {
  /** Lower bound, shared by the number input and the slider. */
  min: number;
  /** Upper bound, shared by the number input and the slider. */
  max: number;
  /**
   * Accessible label for the slider. Defaults to a name derived from the
   * field `name` (e.g. "volume (slider)").
   */
  sliderLabel?: string;
};
