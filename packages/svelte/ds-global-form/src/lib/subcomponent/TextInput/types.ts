import type { HTMLInputAttributes } from "svelte/elements";
import type { Adornment, NativeInputType } from "../types.js";

/** Native text-like input types rendered by the Text input. */
export type TextInputType = NativeInputType;

/** Props for the presentational Text input. */
export type TextInputProps = Omit<
  HTMLInputAttributes,
  "type" | "prefix" | "value"
> & {
  /** The type of the underlying native input. Defaults to `text`. */
  inputType?: TextInputType;
  /** Prefix content, rendered inside `span.prefix`. */
  prefix?: Adornment;
  /** Suffix content, rendered inside `span.suffix`. */
  suffix?: Adornment;
  /** The current value. Bindable. */
  value?: string | number | null;
};
