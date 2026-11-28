import type { ReactNode } from "react";
import { useDataViewsValue } from "../../hooks/index.js";
import { spellPrimitiveValue } from "../../utils/index.js";
import { NotApplicable } from "../NotApplicable/index.js";
import areRecordsEqual from "./areRecordsEqual.js";
import type { FieldContentProps } from "./types.js";

/** The default text reads no record: one identity, so it never redraws. */
const ignoreRecord = (): null => null;

/** A field's own content reads the whole record. */
const keepRecord = <TRow extends object>(record: TRow): TRow | null => record;

/** The default text's null, or two records holding the same fields. */
const isSameRecord = (a: object | null, b: object | null): boolean =>
  a === null || b === null ? a === b : areRecordsEqual(a, b);

/**
 * One field's content in a table's cell or on a card: its text, a dash where
 * the field does not apply, or the field's own cell.
 *
 * @implements ds:apps.subcomponent.data_views-field_content
 */
export default function FieldContent<TRow extends object>({
  channels,
  field,
  columnId,
  cell: Content,
  readApplicability,
}: FieldContentProps<TRow>): ReactNode {
  const channel = channels.fields[field];
  if (channel === undefined) {
    // The scopes observe every field shown, so content without its channel
    // is drawn against another field list.
    throw new Error(`no channel observes the field "${field}"`);
  }
  const value = useDataViewsValue(channel);
  const applicability = useDataViewsValue(channels.record, {
    select: (record) => readApplicability(field, record),
  });
  const record = useDataViewsValue(channels.record, {
    select: Content === undefined ? ignoreRecord : keepRecord<TRow>,
    isEqual: isSameRecord,
  });
  const applies = applicability === "applies";
  if (Content === undefined || record === null) {
    return applies ? spellPrimitiveValue(value) : <NotApplicable />;
  }
  return (
    <Content
      // A value the source wrote where the field does not apply is not shown.
      value={applies ? value : undefined}
      record={record}
      applicability={applicability}
      rowId={channels.id}
      columnId={columnId}
    />
  );
}
