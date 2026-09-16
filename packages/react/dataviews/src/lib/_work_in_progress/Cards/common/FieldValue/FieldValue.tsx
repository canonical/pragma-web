import { memo, type ReactElement, useMemo } from "react";
import {
  CellContext,
  type CellContextValue,
  CustomContent,
  FieldText,
  NotApplicable,
} from "../../../../common/index.js";
import { areFieldScopesEqual, readFieldName } from "../../../../utils/index.js";
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
  return (
    <CellContext value={cell}>
      {Content !== undefined ? (
        <CustomContent
          Content={Content}
          channels={channels}
          channel={channel}
          columnId={field.id}
          applicability={applicability}
        />
      ) : applicability === "not-applicable" ? (
        // A field that does not apply to this record, told apart from one it
        // carries no value for.
        <NotApplicable />
      ) : (
        <FieldText channel={channel} />
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
 * It draws a value as a table's cell does, from the same parts: the default
 * text subscribes to its own field's channel alone, a field's own content to
 * that and to the record's type, and a field that does not apply to the
 * record to neither, so a record republished with another field changed
 * re-renders no value but that field's.
 * Memoised by what it reads, so a card re-rendering for its selection, or
 * for a heading rebuilt inline, re-renders none of them.
 */
export default memo(FieldValue, arePropsEqual) as typeof FieldValue;
