import type { FieldChromeProps } from "../../common/types.js";
import type { PhoneInputProps } from "../../subcomponent/PhoneInput/types.js";

/** Props for the PhoneField: field chrome plus the PhoneInput props. */
export type PhoneFieldProps = FieldChromeProps &
  Omit<PhoneInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
