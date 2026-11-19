import type { ComponentProps } from "react";

/** A format template, always with its spoken form. */
type Format =
  | {
      /** A format template shown behind the typed text, such as `YYYY-MM-DD`. */
      template?: undefined;
      /** The format in words, such as "Date, format YYYY-MM-DD". */
      formatDescription?: string;
    }
  | {
      /** A format template shown behind the typed text, such as `YYYY-MM-DD`. */
      template: string;
      /** The format in words, such as "Date, format YYYY-MM-DD". */
      formatDescription: string;
    };

/** The typed text's fault, whose description the Entry speaks only while invalid. */
type Fault =
  | {
      /** Marks the typed text invalid. */
      invalid?: false;
      /** The message; given only with `invalid`. */
      description?: undefined;
    }
  | {
      /** Marks the typed text invalid. */
      invalid: true;
      /** The message, such as "Invalid: …". */
      description: string;
    };

/** QueryChip.Entry's own props. */
type OwnProps = {
  /** The typed text. */
  value: string;
  /** Called with the typed text after each input. */
  onValueChange: (value: string) => void;
  /** The input's accessible name, such as "Value for status". */
  label: string;
  /** Shown while nothing is typed. */
  placeholder?: string;
  /** Text after the typed text, such as a unit. */
  suffix?: string;
} & Format &
  Fault;

/**
 * QueryChip.Entry's props. The remaining props reach the `<input>`, apart
 * from those the Entry and its chip own: its type, its value, its change
 * handler, its name, its tab order, its disabled state and its invalid
 * state. It takes no `defaultValue`, being controlled, and no children.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type EntryProps = OwnProps &
  Omit<
    ComponentProps<"input">,
    | keyof OwnProps
    | "type"
    | "onChange"
    | "disabled"
    | "aria-invalid"
    | "aria-label"
    | "tabIndex"
    | "defaultValue"
    | "children"
  >;
