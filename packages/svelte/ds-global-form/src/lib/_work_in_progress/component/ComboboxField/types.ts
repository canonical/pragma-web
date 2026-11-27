import type { FieldChromeProps } from "../../../common/types.js";
import type { ComboboxInputProps } from "../../subcomponent/ComboboxInput/types.js";

/** Props for the ComboboxField: field chrome plus the ComboboxInput props. */
export type ComboboxFieldProps = FieldChromeProps &
  Omit<ComboboxInputProps, "id" | "class" | "style"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
