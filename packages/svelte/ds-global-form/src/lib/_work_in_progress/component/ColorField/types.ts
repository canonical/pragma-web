import type { FieldChromeProps } from "../../../common/types.js";
import type { ColorInputProps } from "../../subcomponent/ColorInput/types.js";

/** Props for the ColorField: field chrome plus the ColorInput props. */
export type ColorFieldProps = FieldChromeProps &
  Omit<ColorInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
