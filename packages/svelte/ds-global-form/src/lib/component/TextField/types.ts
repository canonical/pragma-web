import type { FieldChromeProps } from "../../common/types.js";
import type { TextInputProps } from "../../subcomponent/TextInput/types.js";

/** Props for the TextField: field chrome plus the TextInput props. */
export type TextFieldProps = FieldChromeProps &
  Omit<TextInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
