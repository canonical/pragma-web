import type { ToggleChromeProps } from "../../common/types.js";
import type { CheckboxInputProps } from "../../subcomponent/CheckboxInput/types.js";

/**
 * Props for the CheckboxField: toggle chrome plus the CheckboxInput props. `value` is the
 * checked state; at least one of `label`/`controlLabel` is required.
 */
export type CheckboxFieldProps = ToggleChromeProps &
  Omit<
    CheckboxInputProps,
    "id" | "class" | "style" | "name" | "checked" | "value"
  > & {
    /** Whether the control is checked. Bindable. */
    value?: boolean;
  };
