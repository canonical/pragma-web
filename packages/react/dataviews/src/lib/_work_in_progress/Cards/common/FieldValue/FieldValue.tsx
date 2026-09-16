import { memo, type ReactElement, useMemo } from "react";
import {
  CellContext,
  type CellContextValue,
  NotApplicable,
} from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import {
  areFieldScopesEqual,
  readFieldName,
  spellPrimitiveValue,
} from "../../../../utils/index.js";
import type { FieldValueProps } from "./types.js";

/**
 * Whether a value is handed what it draws unchanged: every prop the same,
 * the field compared by what the value reads of it — its id, the record
 * field, its own content and its types — and never its heading, which the
 * card draws and the value does not.
 */
const arePropsEqual = <TRow extends object>(
  a: FieldValueProps<TRow>,
  b: FieldValueProps<TRow>,
): boolean =>
  a.provider === b.provider &&
  a.channels === b.channels &&
  a.applicability === b.applicability &&
  a.field.cell === b.field.cell &&
  areFieldScopesEqual([a.field], [b.field]);

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
  const value = useDataViewsValue(channel);
  // Drawn again when the record returns as another type, so content narrowing
  // on the record reads its current type even where its value and
  // applicability did not move.
  useDataViewsValue(channels.type);
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
        // A field that does not apply to this record, told apart from one it
        // carries no value for.
        <NotApplicable />
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
 * render as text, a field that does not apply to the record draws the
 * not-applicable state, and every other value renders nothing.
 *
 * It subscribes to its own field's channel and the record's type alone, so
 * a record republished
 * with another field changed re-renders no value but that field's; the
 * record a field's own content is handed is read as the value renders.
 * Memoised by what it reads, so a card re-rendering for its selection, or
 * for a heading rebuilt inline, re-renders none of them.
 */
export default memo(FieldValue, arePropsEqual) as typeof FieldValue;
