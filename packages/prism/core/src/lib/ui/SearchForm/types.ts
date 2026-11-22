import type { ComponentProps } from "react";

type OwnProps = {
  /** The search text, as the address holds it: the field's first value. */
  readonly text: string;
  /** What the empty field says the site searches. */
  readonly placeholder: string;
};

/**
 * Props accepted by `SearchForm`: the address's text and the placeholder,
 * then the native
 * props of its `<form>` root. The native `children` are excluded because
 * the form renders its own field and button.
 */
export type SearchFormProps = OwnProps &
  Omit<ComponentProps<"form">, keyof OwnProps | "children">;
