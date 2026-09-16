import type { ReactElement } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { readFieldName } from "../../../../utils/index.js";
import { HeaderNamedCheckbox, NamedCheckbox } from "./common/index.js";
import type { SelectionCellProps } from "./types.js";

/**
 * One row's selection checkbox: the design system's checkbox backed by the
 * provider's selection, named after the record rather than its position —
 * by the caller's label where it gave one, else by the row header's text
 * where a column is the row header, else by the record's identity.
 */
export default function SelectionCell<TRow extends object>({
  rowLabel,
  rowHeader,
  ...props
}: SelectionCellProps<TRow>): ReactElement {
  const { channels } = props;
  const headerField = rowHeader === null ? null : readFieldName(rowHeader);
  const nameChannel =
    headerField === null ? null : channels.fields[headerField];
  if (nameChannel === undefined) {
    // The scopes observe every field the columns read, the header's included.
    throw new Error(`no channel observes the field "${headerField}"`);
  }
  // Read as the name it yields rather than the record it is read from: a
  // record republished with another field moved re-renders no checkbox. A
  // name is a string, so equal names are identical reads.
  const named = useDataViewsValue(channels.record, (record) =>
    rowLabel(record, channels.id),
  );
  return nameChannel === null ? (
    <NamedCheckbox {...props} name={named ?? channels.id} />
  ) : (
    <HeaderNamedCheckbox {...props} channel={nameChannel} named={named} />
  );
}
