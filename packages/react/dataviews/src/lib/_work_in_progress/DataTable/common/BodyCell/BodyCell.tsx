import type { Applicability } from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import {
  type ComponentType,
  memo,
  type ReactElement,
  useContext,
  useMemo,
} from "react";
import {
  CellContext,
  type CellContextValue,
  type DisplayFieldCellProps,
  MessagesContext,
} from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { spellPrimitiveValue } from "../../../../utils/index.js";
import type { BodyCellProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell";

/**
 * What a cell shows for a field its row's record does not carry at all: a
 * dash, with the word for it read and not drawn.
 *
 * The dash alone would be indistinguishable from an empty field, which is a
 * different fact — the record has no value there, rather than the field not
 * being one of its own — so the two are told apart by what is read, not by
 * what is seen.
 */
function NotApplicable(): ReactElement {
  const messages = useContext(MessagesContext);
  return (
    <>
      <span aria-hidden="true">—</span>
      <span hidden>{messages.cellNotApplicable}</span>
    </>
  );
}

/**
 * The default content of a cell: its own field's value as text.
 *
 * Subscribed to that one field, so a record republished with another field
 * changed re-renders nothing here.
 */
function FieldText({
  channel,
}: {
  readonly channel: RowChannels<object>["fields"][string];
}): ReactElement {
  const value = useDataViewsValue(channel);
  return <>{spellPrimitiveValue(value)}</>;
}

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
function CustomContent<TRow extends object>({
  Content,
  channels,
  channel,
  columnId,
  applicability,
}: {
  readonly Content: ComponentType<DisplayFieldCellProps>;
  readonly channels: RowChannels<TRow>;
  readonly channel: RowChannels<TRow>["fields"][string];
  readonly columnId: string;
  readonly applicability: Applicability;
}): ReactElement {
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

function BodyCell<TRow extends object>({
  provider,
  channels,
  column,
  field,
  id,
  applicability,
}: BodyCellProps<TRow>): ReactElement {
  const channel = channels.fields[field];
  if (channel === undefined) {
    // The scopes observe every field the columns read, so a cell without
    // its channel is a table built against another column list.
    throw new Error(`no channel observes the field "${field}"`);
  }
  const cell = useMemo<CellContextValue>(
    () => ({
      collection: provider.collection,
      rowId: channels.id,
      columnId: column.id,
      record: channels.record,
      fields: channels.fields,
      selected: channels.selected,
      applicability,
    }),
    [provider, channels, column.id, applicability],
  );
  const Content = column.cell;
  const header = column.rowHeader === true;
  return (
    <CellContext value={cell}>
      {/* biome-ignore lint/a11y/useSemanticElements: <td> and <th> are only valid inside a <table>, and this grid is deliberately not one */}
      <div
        id={id}
        role={header ? "rowheader" : "cell"}
        className={[componentCssClassName, header && "row-header"]
          .filter(Boolean)
          .join(" ")}
      >
        {Content !== undefined ? (
          <CustomContent
            Content={Content}
            channels={channels}
            channel={channel}
            columnId={column.id}
            applicability={applicability}
          />
        ) : applicability === "not-applicable" ? (
          <NotApplicable />
        ) : (
          <FieldText channel={channel} />
        )}
      </div>
    </CellContext>
  );
}

/**
 * The body cell is the data cell element that displays content in each row
 * of the data table. It comes in four types: checkbox, text, icon + text,
 * and action. Some cell types support inline editing with multiple edit
 * modes, and the action cell type supports inline action buttons for
 * row-level operations.
 *
 * The body cell is distinct from the header cell. While the header cell
 * handles column-level controls such as sorting, resizing, reordering, and
 * pinning, the body cell is responsible for presenting data values and
 * providing row-level interactions such as inline editing and row actions.
 *
 * That is the design system's description of the block. What this
 * implementation covers: the text cell, the cell of a field a record's type
 * does not carry, a column's own renderer, and the row header — the cell of
 * the one column declared `rowHeader`, which names its row — with no inline
 * editing or row actions yet. A cell showing a field's value subscribes to that one field,
 * so a record update re-renders only the cells whose values actually
 * changed; a cell drawing a column's own content subscribes to the record,
 * which that content is handed. Either way it installs the cell context the
 * content reads.
 *
 * Memoised: without it the claim above would hold for the channel and be
 * undone by the row, which would re-render every cell it has whenever it
 * rendered at all.
 *
 * @implements ds:apps.subcomponent.data_table-body_cell
 */
export default memo(BodyCell) as typeof BodyCell;
