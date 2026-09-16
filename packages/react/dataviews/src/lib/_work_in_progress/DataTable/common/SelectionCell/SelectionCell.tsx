import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { readFieldName, spellPrimitiveValue } from "../../../../utils/index.js";
import type { SelectionCellProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell selection";

/** The cell and its checkbox, once the row's name is known. */
function Checkbox<TRow extends object>({
  provider,
  channels,
  selected,
  name,
}: Pick<SelectionCellProps<TRow>, "provider" | "channels" | "selected"> & {
  readonly name: string;
}): ReactElement {
  const messages = useContext(MessagesContext);
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

/**
 * The checkbox of a row a column heads, named by that column's text where
 * the caller gave no name. Watches the header's channel as the text it
 * spells, so the name follows the text on screen and nothing else.
 */
function HeaderNamedCheckbox<TRow extends object>({
  channel,
  named,
  ...props
}: Pick<SelectionCellProps<TRow>, "provider" | "channels" | "selected"> & {
  readonly channel: SelectionCellProps<TRow>["channels"]["fields"][string];
  readonly named: string | null;
}): ReactElement {
  const spelled = useDataViewsValue(channel, spellPrimitiveValue);
  // Blank is no name at all: a header holding empty text, or none, leaves
  // the row named by its identity rather than by nothing.
  const name =
    named ??
    (spelled !== null && spelled.trim() !== "" ? spelled : props.channels.id);
  return <Checkbox {...props} name={name} />;
}

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
    <Checkbox {...props} name={named ?? channels.id} />
  ) : (
    <HeaderNamedCheckbox {...props} channel={nameChannel} named={named} />
  );
}
