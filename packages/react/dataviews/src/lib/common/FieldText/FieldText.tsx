import type { ReactElement } from "react";
// The channel hook and the text spelling alone, by their own modules: the
// hooks and utils barrels read `common/`, which reads no barrel of theirs.
import useDataViewsValue from "../../hooks/useDataViewsValue.js";
import spellPrimitiveValue from "../../utils/spellPrimitiveValue.js";
import type { FieldTextProps } from "./types.js";

/**
 * The default content of a table's cell or a card's field: its own field's
 * value as text.
 *
 * Subscribed to that one field, so a record republished with another field
 * changed re-renders nothing here.
 */
export default function FieldText({ channel }: FieldTextProps): ReactElement {
  const value = useDataViewsValue(channel);
  return <>{spellPrimitiveValue(value)}</>;
}
