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
  const record = useDataViewsValue(channels.record);
  const headerField = rowHeader === null ? null : readFieldName(rowHeader);
  const nameChannel =
    headerField === null ? null : channels.fields[headerField];
  if (nameChannel === undefined) {
    // The scopes observe every field the columns read, the header's included.
    throw new Error(`no channel observes the field "${headerField}"`);
  }
  // The header's own channel where there is one, so the name follows the
  // text on screen; the record otherwise, which is already watched.
  const headerValue = useDataViewsValue(nameChannel ?? channels.record);
  const spelled =
    nameChannel === null ? null : spellPrimitiveValue(headerValue);
  // Blank is no name at all: a header holding empty text, or none, leaves
  // the row named by its identity rather than by nothing.
  const name =
    rowLabel(record, channels.id) ??
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
