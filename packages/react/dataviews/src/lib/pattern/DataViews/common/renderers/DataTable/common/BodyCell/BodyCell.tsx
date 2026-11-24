import { memo, type ReactElement, useMemo } from "react";
import { FieldContent } from "../../../../../../../common/FieldContent/index.js";
import {
  CellContext,
  type CellContextValue,
} from "../../../../../../../common/index.js";
import type { BodyCellProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell";

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
 * Covers the text cell and a column's renderer; no inline editing or row
 * actions.
 *
 * @implements ds:apps.subcomponent.data_table-body_cell
 */
const BodyCell = <TRow extends object>({
  provider,
  channels,
  column,
  field,
  readApplicability,
  className,
  ...rest
}: BodyCellProps<TRow>): ReactElement => {
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
  return (
    <CellContext value={cell}>
      <td
        {...rest}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <FieldContent
          channels={channels}
          field={field}
          columnId={column.id}
          cell={column.cell}
          readApplicability={readApplicability}
        />
      </td>
    </CellContext>
  );
};

export default memo(BodyCell) as typeof BodyCell;
