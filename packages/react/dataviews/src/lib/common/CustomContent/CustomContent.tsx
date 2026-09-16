import type { ReactElement } from "react";
import useDataViewsValue from "../../hooks/useDataViewsValue.js";
import type { CustomContentProps } from "./types.js";

/**
 * A field's own content, in a table's cell or on a card, handed its field's
 * value and the record the value was read from.
 *
 * Subscribed to that one field, as the default text is, and to the record's
 * type: a record republished with another field changed re-renders no
 * content but that field's, and one returning as another type re-renders
 * content that may narrow on it. The record is read as the content renders,
 * so it is the record the value came from; content drawing more of the
 * record than its own field subscribes to it through `useDataViewsCell`.
 */
export default function CustomContent<TRow extends object>({
  Content,
  channels,
  channel,
  columnId,
  applicability,
}: CustomContentProps<TRow>): ReactElement {
  const value = useDataViewsValue(channel);
  // Drawn again when the record returns as another type, so content narrowing
  // on the record reads its current type even where its value did not move.
  useDataViewsValue(channels.type);
  return (
    <Content
      // A record the field does not apply to holds no value there: one the
      // source wrote anyway is not shown as if it did.
      value={applicability === "not-applicable" ? undefined : value}
      record={channels.record.get()}
      applicability={applicability}
      rowId={channels.id}
      columnId={columnId}
    />
  );
}
