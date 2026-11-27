import type { Condition } from "../../common/types.js";
import type { HiddenInputProps } from "../../subcomponent/HiddenInput/types.js";

/** Props for the HiddenField: a hidden input with the field ID, no chrome. */
export type HiddenFieldProps = Omit<HiddenInputProps, "name"> & {
  /** Name of the control. */
  name: string;
  /** Accepted like any field's; a hidden input is never required. */
  isOptional?: boolean;
  /** Accepted like any field's; a hidden input shows no error. */
  error?: string;
  /** Decides whether the field is rendered. */
  condition?: Condition;
};
