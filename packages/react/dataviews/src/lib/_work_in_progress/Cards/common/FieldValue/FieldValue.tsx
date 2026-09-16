import { memo, type ReactElement, useContext, useMemo } from "react";
import {
  CellContext,
  type CellContextValue,
  MessagesContext,
} from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { readFieldName, spellPrimitiveValue } from "../../../../utils/index.js";
import type { FieldValueProps } from "./types.js";

function FieldValue<TRow extends object>({
  provider,
  channels,
  field,
  applicability,
}: FieldValueProps<TRow>): ReactElement {
  const name = readFieldName(field);
  const channel = channels.fields[name];
  if (channel === undefined) {
    // The scopes observe every field the cards show, so a value without its
    // channel is a card built against another field list.
    throw new Error(`no channel observes the field "${name}"`);
  }
  const messages = useContext(MessagesContext);
  const value = useDataViewsValue(channel);
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
  const Content = field.cell;
  const notApplicable = applicability === "not-applicable";
  return (
    <CellContext value={cell}>
      {Content !== undefined ? (
        <Content
          // A record the field does not apply to holds no value there: one
          // the source wrote anyway is not shown as if it did.
          value={notApplicable ? undefined : value}
          // Read as the value renders, so it is the record the value came
          // from; content drawing more of it subscribes through the cell.
          record={channels.record.get()}
          applicability={applicability}
          rowId={channels.id}
          columnId={field.id}
        />
      ) : notApplicable ? (
        // A field this record's type does not carry, told apart from one it
        // carries no value for: the dash is seen, the word is read — clipped,
        // not hidden, so it stays in the accessibility tree.
        <>
          <span aria-hidden="true">—</span>
          <span className="not-applicable">{messages.cellNotApplicable}</span>
        </>
      ) : (
        spellPrimitiveValue(value)
      )}
    </CellContext>
  );
}

/**
 * One field's value on a card, inside the same cell scope a table's cell
 * installs, so a field's own `cell` renders unchanged on a card and may call
 * `useDataViewsCell` for the record's channels. Without one, primitive values
 * render as text, a field the record's type does not carry draws the
 * not-applicable state, and every other value renders nothing.
 *
 * It subscribes to its own field's channel alone, so a record republished
 * with another field changed re-renders no value but that field's; the
 * record a field's own content is handed is read as the value renders.
 * Memoised, so a card re-rendering for its selection re-renders none of them.
 */
export default memo(FieldValue) as typeof FieldValue;
