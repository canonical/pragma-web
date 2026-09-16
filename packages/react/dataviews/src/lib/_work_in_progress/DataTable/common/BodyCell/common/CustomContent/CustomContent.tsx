import type { ReactElement } from "react";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import type { CustomContentProps } from "./types.js";

/**
 * A column's own content, handed its field's value and the record the value
 * was read from.
 *
 * Subscribed to that one field, as the text cell is: the table's guarantee
 * is that a record republished with another field changed re-renders no
 * cell but that field's, and content is held to it too. The record is read
 * as the cell renders, so it is the record the value came from; content
 * drawing more of the record than its own field subscribes to it through
 * `useDataViewsCell`.
 */
export default function CustomContent<TRow extends object>({
  Content,
  channels,
  channel,
  columnId,
  applicability,
}: CustomContentProps<TRow>): ReactElement {
  const value = useDataViewsValue(channel);
  return (
    <Content
      // A row the field does not apply to holds no value there: one the
      // source wrote anyway is not shown as if it did.
      value={applicability === "not-applicable" ? undefined : value}
      record={channels.record.get()}
      applicability={applicability}
      rowId={channels.id}
      columnId={columnId}
    />
  );
}
