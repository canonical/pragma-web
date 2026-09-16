import type { ReactElement } from "react";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import { spellPrimitiveValue } from "../../../../../../utils/index.js";
import { NamedCheckbox } from "../NamedCheckbox/index.js";
import type { HeaderNamedCheckboxProps } from "./types.js";

/**
 * The checkbox of a row a column heads, named by that column's text where
 * the caller gave no name. Watches the header's channel as the text it
 * spells, so the name follows the text on screen and nothing else.
 */
export default function HeaderNamedCheckbox<TRow extends object>({
  channel,
  named,
  ...props
}: HeaderNamedCheckboxProps<TRow>): ReactElement {
  const spelled = useDataViewsValue(channel, spellPrimitiveValue);
  // Blank is no name at all: a header holding empty text, or none, leaves
  // the row named by its identity rather than by nothing.
  const name =
    named ??
    (spelled !== null && spelled.trim() !== "" ? spelled : props.channels.id);
  return <NamedCheckbox {...props} name={name} />;
}
