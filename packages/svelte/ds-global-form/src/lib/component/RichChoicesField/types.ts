import type { ClassValue } from "svelte/elements";
import type { FieldChromeProps } from "../../common/types.js";
import type { Adornment, GroupAriaProps } from "../../subcomponent/types.js";

/** A rich choice: its label is text or a snippet (card, icon, …). */
export type RichChoiceOption = {
  value: string;
  /** Freely shaped label content. */
  label: Adornment;
  disabled?: boolean;
};

/** Props for the presentational RichChoices group. */
export type RichChoicesProps = GroupAriaProps & {
  /** A unique identifier for the group. */
  id?: string;
  /** Additional CSS classes. */
  class?: ClassValue;
  /** Inline styles. */
  style?: string;
  /** Field name shared by every option input in the group. */
  name: string;
  /** Choice options. */
  options: readonly RichChoiceOption[];
  /** Allow several selections (checkboxes) instead of one (radios). */
  isMultiple?: boolean;
  /** Whether all options are disabled. */
  disabled?: boolean;
  /**
   * The selected value: a string for radios, the selected strings for
   * checkboxes. Bindable.
   */
  value?: string | string[];
};

/** Props for the RichChoicesField: field chrome plus the RichChoices props. */
export type RichChoicesFieldProps = FieldChromeProps &
  Omit<
    RichChoicesProps,
    "id" | "class" | "style" | "name" | keyof GroupAriaProps
  > & {
    /** Where the description sits: above the options or below them. */
    descriptionPosition?: "leading" | "trailing";
  };
