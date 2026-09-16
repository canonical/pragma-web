import type { ReactElement } from "react";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import { spellPrimitiveValue } from "../../../../../../utils/index.js";
import type { FieldTextProps } from "./types.js";

/**
 * The default content of a cell: its own field's value as text.
 *
 * Subscribed to that one field, so a record republished with another field
 * changed re-renders nothing here.
 */
export default function FieldText({ channel }: FieldTextProps): ReactElement {
  const value = useDataViewsValue(channel);
  return <>{spellPrimitiveValue(value)}</>;
}
