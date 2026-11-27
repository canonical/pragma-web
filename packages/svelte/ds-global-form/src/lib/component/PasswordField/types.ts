import type { FieldChromeProps } from "../../common/types.js";
import type { PasswordInputProps } from "../../subcomponent/PasswordInput/types.js";

/** Props for the PasswordField: field chrome plus the PasswordInput props. */
export type PasswordFieldProps = FieldChromeProps &
  Omit<PasswordInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
