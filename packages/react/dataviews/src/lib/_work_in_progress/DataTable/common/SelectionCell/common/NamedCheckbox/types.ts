import type { SelectionCellProps } from "../../types.js";

/** Props of a row's selection checkbox, once the row's name is known. */
export type NamedCheckboxProps<TRow extends object> = Pick<
  SelectionCellProps<TRow>,
  "provider" | "channels" | "selected"
> & {
  /** What the row is called, which the checkbox's name says. */
  readonly name: string;
};
