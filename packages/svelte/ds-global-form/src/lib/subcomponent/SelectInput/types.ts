import type { HTMLSelectAttributes } from "svelte/elements";
import type { OptionsProps } from "../types.js";

/** Props for the presentational Select input. */
export type SelectInputProps = Omit<HTMLSelectAttributes, "value"> &
  OptionsProps & {
    /**
     * The selected value: a string, or the selected strings when `multiple`.
     * Bindable.
     */
    value?: string | string[];
  };
