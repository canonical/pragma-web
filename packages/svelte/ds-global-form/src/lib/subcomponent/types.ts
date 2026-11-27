import type { Snippet } from "svelte";

/** A selectable option for choice-style inputs (Select, Choices, Combobox). */
export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
  /**
   * BCP 47 language of the label, when it differs from the page's: a language
   * picker labels each option in its own language, and `lang` lets assistive
   * technology pronounce it correctly.
   */
  lang?: string;
};

/** The options of a choice-style input. */
export type OptionsProps = {
  options: readonly Option[];
};

/**
 * ARIA wiring for an option group's fieldset. The field tier supplies these, so
 * the group is named by the field label and described by its description and
 * error.
 */
export type GroupAriaProps = {
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

/** Native text-like input types associated with a text input. */
export type NativeInputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "tel"
  | "url";

/** Text or a snippet rendered as a decoration beside a control. */
export type Adornment = string | Snippet;
