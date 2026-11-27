import type { Option } from "../../../../subcomponent/types.js";

export interface OptionProps {
  /** Field name shared by every option input in the group. */
  name: string;
  /** Native input type backing the option (radios or checkboxes). */
  type: "checkbox" | "radio";
  /** The option to render. */
  option: Option;
  /** Whether this option is selected. Bindable. */
  checked?: boolean;
  /** Whether this option is disabled. */
  disabled: boolean;
}
