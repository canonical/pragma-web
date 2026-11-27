import type { FieldChromeProps } from "../../common/types.js";
import type { DateInputProps } from "../../subcomponent/DateInput/types.js";

/** Props for the DateField: field chrome plus the DateInput props. */
export type DateFieldProps = FieldChromeProps &
  Omit<DateInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
