import type { FieldChromeProps } from "../../../common/types.js";
import type { RatingInputProps } from "../../subcomponent/RatingInput/types.js";

/** Props for the RatingField: field chrome plus the RatingInput props. */
export type RatingFieldProps = FieldChromeProps &
  Omit<RatingInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
