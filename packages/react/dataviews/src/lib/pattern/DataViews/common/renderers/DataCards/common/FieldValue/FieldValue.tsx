import { memo, type ReactElement, useMemo } from "react";
import {
  CellContext,
  type CellContextValue,
  FieldContent,
} from "../../../../../../../common/index.js";
import { readFieldName } from "../../../../../../../utils/index.js";
import type { FieldValueProps } from "./types.js";

/**
 * One field's value on a card, inside the same cell scope a table's cell
 * installs, so a field's own `cell` renders unchanged on a card and may call
 * `useDataViewsCell` for the record's channels. Without one, primitive values
 * render as text and every other value renders nothing.
 *
 * Its default text subscribes to its own field's channel, so a record
 * update re-renders only the values that changed. Memoised, so a card
 * re-rendering for its selection re-renders none of them.
 *
 * @implements ds:apps.subcomponent.data_cards-field_value
 */
const FieldValue = <TRow extends object>({
  provider,
  channels,
  field,
  readApplicability,
}: FieldValueProps<TRow>): ReactElement => {
  const cell = useMemo<CellContextValue>(
    () => ({
      collection: provider.collection,
      rowId: channels.id,
      columnId: field.id,
      record: channels.record,
      fields: channels.fields,
      selected: channels.selected,
    }),
    [provider, channels, field.id],
  );
  return (
    <CellContext value={cell}>
      <FieldContent
        channels={channels}
        field={readFieldName(field)}
        columnId={field.id}
        cell={field.cell}
        readApplicability={readApplicability}
      />
    </CellContext>
  );
};

export default memo(FieldValue) as typeof FieldValue;
