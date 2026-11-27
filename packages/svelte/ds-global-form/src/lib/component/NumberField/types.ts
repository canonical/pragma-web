import type { FieldChromeProps } from "../../common/types.js";
import type { NumberInputProps } from "../../subcomponent/NumberInput/types.js";

/** Props for the NumberField: field chrome plus the NumberInput props. */
export type NumberFieldProps = FieldChromeProps &
  Omit<NumberInputProps, "id" | "class" | "style" | "name"> & {
    /** Where the description sits: above the control or below it. */
    descriptionPosition?: "leading" | "trailing";
  };
