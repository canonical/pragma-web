import { memo, type ReactElement, useMemo } from "react";
import {
  CellContext,
  type CellContextValue,
  NotApplicable,
} from "../../../../common/index.js";
import { readFieldName } from "../../../../utils/index.js";
import { CustomContent, FieldText } from "./common/index.js";
import type { BodyCellProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell";

function BodyCell<TRow extends object>({
  provider,
  channels,
  column,
  id,
  applicability,
}: BodyCellProps<TRow>): ReactElement {
  const field = readFieldName(column);
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
    }),
    [provider, channels, column.id],
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
 * implementation covers: the text cell, the cell of a field that does not
 * apply to a record's type, a column's own renderer, and the row header —
 * the cell of the one column declared `rowHeader`, which names its row — with
 * no inline editing or row actions yet. Every cell subscribes to its own
 * field alone, so a record update re-renders only the cells whose values
 * actually changed; the record a column's own content is handed is read as
 * it renders, and the cell draws again when the record's type moves.
 * Either way it installs the cell context the content reads.
 *
 * Memoised: without it the claim above would hold for the channel and be
 * undone by the row, which would re-render every cell it has whenever it
 * rendered at all.
 *
 * @implements ds:apps.subcomponent.data_table-body_cell
 */
export default memo(BodyCell) as typeof BodyCell;
