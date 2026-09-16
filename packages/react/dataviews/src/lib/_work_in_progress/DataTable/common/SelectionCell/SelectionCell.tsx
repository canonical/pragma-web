import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { readFieldName, spellPrimitiveValue } from "../../../../utils/index.js";
import type { SelectionCellProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell selection";

/**
 * One row's selection checkbox: the design system's checkbox backed by the
 * provider's selection, named after the record rather than its position —
 * by the caller's label where it gave one, else by the row header's text
 * where a column is the row header, else by the record's identity.
 */
export default function SelectionCell<TRow extends object>({
  provider,
  channels,
  selected,
  rowLabel,
  rowHeader,
}: SelectionCellProps<TRow>): ReactElement {
  const messages = useContext(MessagesContext);
  const headerField = rowHeader === null ? null : readFieldName(rowHeader);
  const nameChannel =
    headerField === null ? null : channels.fields[headerField];
  if (nameChannel === undefined) {
    // The scopes observe every field the columns read, the header's included.
    throw new Error(`no channel observes the field "${headerField}"`);
  }
  // Each read as the name it yields rather than the value it is read from:
  // a record republished with another field moved re-renders no checkbox.
  // A name is a string, so equal names are identical reads.
  const named = useDataViewsValue(channels.record, (record) =>
    rowLabel(record, channels.id),
  );
  // The header's text, where a column is the row header; where none is, a
  // channel the row already watches, read as nothing.
  const spelled = useDataViewsValue(
    nameChannel ?? channels.selected,
    (value) => (nameChannel === null ? null : spellPrimitiveValue(value)),
  );
  // Blank is no name at all: a header holding empty text, or none, leaves
  // the row named by its identity rather than by nothing.
  const name =
    named ??
    (spelled !== null && spelled.trim() !== "" ? spelled : channels.id);
  return (
    // biome-ignore lint/a11y/useSemanticElements: <td> is only valid inside a <table>, and this grid is deliberately not one
    <div role="cell" className={componentCssClassName}>
      <CheckboxInput
        checked={selected}
        aria-label={messages.selectRow(name)}
        onChange={() => {
          provider.selection.toggle(channels.id);
        }}
      />
    </div>
  );
}
