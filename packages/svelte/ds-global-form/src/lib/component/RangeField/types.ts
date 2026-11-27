import type { FieldChromeProps } from "../../common/types.js";
import type { RangeControlProps } from "./common/RangeControl/types.js";

/** Props for the RangeField: field chrome plus the RangeControl props. */
export type RangeFieldProps = FieldChromeProps &
  Omit<RangeControlProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
