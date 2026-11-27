import type { FieldChromeProps } from "../../common/types.js";
import type { SelectInputProps } from "../../subcomponent/SelectInput/types.js";

/** Props for the SelectField: field chrome plus the SelectInput props. */
export type SelectFieldProps = FieldChromeProps &
  Omit<SelectInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
