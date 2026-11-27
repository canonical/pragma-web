import type { FieldChromeProps } from "../../common/types.js";
import type { DateTimeInputProps } from "../../subcomponent/DateTimeInput/types.js";

/** Props for the DateTimeField: field chrome plus the DateTimeInput props. */
export type DateTimeFieldProps = FieldChromeProps &
  Omit<DateTimeInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
