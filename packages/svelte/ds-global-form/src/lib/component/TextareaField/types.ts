import type { FieldChromeProps } from "../../common/types.js";
import type { TextareaInputProps } from "../../subcomponent/TextareaInput/types.js";

/** Props for the TextareaField: field chrome plus the TextareaInput props. */
export type TextareaFieldProps = FieldChromeProps &
  Omit<TextareaInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
