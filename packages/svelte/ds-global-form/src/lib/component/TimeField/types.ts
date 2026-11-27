import type { FieldChromeProps } from "../../common/types.js";
import type { TimeInputProps } from "../../subcomponent/TimeInput/types.js";

/** Props for the TimeField: field chrome plus the TimeInput props. */
export type TimeFieldProps = FieldChromeProps &
  Omit<TimeInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
