import type { NamedCheckboxProps } from "../NamedCheckbox/index.js";

/**
 * Props of the checkbox of a row a column heads.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * handing its props to `NamedCheckbox`, with no element of its own.
 */
export type HeaderNamedCheckboxProps<TRow extends object> = Omit<
  NamedCheckboxProps<TRow>,
  "name"
> & {
  /** The channel of the field the row header shows. */
  readonly channel: NamedCheckboxProps<TRow>["channels"]["fields"][string];
  /** The caller's name for the row, or null where it gave none. */
  readonly named: string | null;
};
