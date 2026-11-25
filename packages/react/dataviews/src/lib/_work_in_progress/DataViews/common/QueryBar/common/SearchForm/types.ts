import type { ReactNode } from "react";

/**
 * Props of the bar's search form.
 *
 * Exempt from the native-prop extension convention: an internal wrapper
 * that renders either a form or its children alone.
 */
export type SearchFormProps = {
  /** Whether the location spells addresses: only then is there a form. */
  readonly hasHref: boolean;
  /** The field the form submits. */
  readonly children: ReactNode;
};
