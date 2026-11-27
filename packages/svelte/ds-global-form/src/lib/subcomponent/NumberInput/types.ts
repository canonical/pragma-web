import type { HTMLInputAttributes } from "svelte/elements";
import type { Adornment } from "../types.js";

/** Props for the presentational Number input. */
export type NumberInputProps = Omit<
  HTMLInputAttributes,
  "type" | "prefix" | "value"
> & {
  /** Prefix content, rendered inside `span.prefix` (e.g. a currency symbol). */
  prefix?: Adornment;
  /** Suffix content, rendered inside `span.suffix` (e.g. a unit). */
  suffix?: Adornment;
  /** The current value; `null` when the input is empty. Bindable. */
  value?: number | null;
};
