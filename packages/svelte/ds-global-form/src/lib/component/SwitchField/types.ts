import type { ToggleChromeProps } from "../../common/types.js";
import type { SwitchInputProps } from "../../subcomponent/SwitchInput/types.js";

/**
 * Props for the SwitchField: toggle chrome plus the SwitchInput props. `value` is the
 * checked state; at least one of `label`/`controlLabel` is required.
 */
export type SwitchFieldProps = ToggleChromeProps &
  Omit<
    SwitchInputProps,
    "id" | "class" | "style" | "name" | "checked" | "value"
  > & {
    /** Whether the control is checked. Bindable. */
    value?: boolean;
  };
