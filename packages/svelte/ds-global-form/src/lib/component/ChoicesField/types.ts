import type { ClassValue } from "svelte/elements";
import type { FieldChromeProps } from "../../common/types.js";
import type { GroupAriaProps, OptionsProps } from "../../subcomponent/types.js";

/** Props for the presentational Choices group. */
export type ChoicesProps = OptionsProps &
  GroupAriaProps & {
    /** A unique identifier for the group. */
    id?: string;
    /** Additional CSS classes. */
    class?: ClassValue;
    /** Inline styles. */
    style?: string;
    /** Field name shared by every option input in the group. */
    name: string;
    /** Allow several selections, rendered as checkboxes instead of radios. */
    isMultiple?: boolean;
    /** Whether the group is disabled. */
    disabled?: boolean;
    /**
     * Layout of the option group:
     *  - "inline" (default): options wrap horizontally, each as wide as its content
     *  - "stacked": one option per line
     *  - "columns": a grid of equal-width columns (see `columns`)
     */
    layout?: "inline" | "stacked" | "columns";
    /** Number of equal-width columns when `layout="columns"`. */
    columns?: number;
    /**
     * The selected value: a string for radios, the selected strings for
     * checkboxes. Bindable.
     */
    value?: string | string[];
  };

/** Props for the ChoicesField: field chrome plus the Choices props. */
export type ChoicesFieldProps = FieldChromeProps &
  Omit<
    ChoicesProps,
    "id" | "class" | "style" | "name" | keyof GroupAriaProps
  > & {
    /** Where the description sits: above the options or below them. */
    descriptionPosition?: "leading" | "trailing";
  };
