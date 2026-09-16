import { memo, type ReactElement, useId } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { readFieldName } from "../../../../utils/index.js";
import { BodyCell } from "../BodyCell/index.js";
import { SelectionCell } from "../SelectionCell/index.js";
import type { RowProps } from "./types.js";

const componentCssClassName = "ds data-table-row";

function Row<TRow extends object>({
  provider,
  channels,
  columns,
  rowHeader,
  selectable,
  rowLabel,
  position,
  ref,
  applicabilityOf,
}: RowProps<TRow>): ReactElement {
  const selected = useDataViewsValue(channels.selected);
  // The row is named by its header cell where a column is the row header:
  // a reader hears the name before each of the row's other cells.
  const headerId = useId();
  // Read as the row renders rather than subscribed: which columns apply to
  // a record is a fact about its type, which no record changes under a row,
  // and a subscription here would re-render every cell for any field's move.
  const record = channels.record.get();
  return (
    // aria-selected is only meaningful where selection is offered, and it
    // must agree with the row's checkbox: both read this one channel.
    // biome-ignore lint/a11y/useSemanticElements: <tr> is only valid inside a <table>, and this grid is deliberately not one
    // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, not a widget — the focusable controls live in its cells
    <div
      ref={ref}
      role="row"
      className={[componentCssClassName, selected && "selected"]
        .filter(Boolean)
        .join(" ")}
      aria-selected={selectable ? selected : undefined}
      aria-rowindex={position}
      aria-labelledby={rowHeader === null ? undefined : headerId}
    >
      {selectable ? (
        <SelectionCell
          provider={provider}
          channels={channels}
          selected={selected}
          rowLabel={rowLabel}
          rowHeader={rowHeader}
        />
      ) : null}
      {columns.map((column) => (
        <BodyCell
          key={column.id}
          id={column.rowHeader === true ? headerId : undefined}
          provider={provider}
          channels={channels}
          column={column}
          field={readFieldName(column)}
          applicability={applicabilityOf(column, record)}
        />
      ))}
    </div>
  );
}

/**
 * One data row. It observes its own selection membership — a selection
 * change reaches only the rows whose membership moved — and consumes the
 * table's shared track list rather than a width per cell.
 *
 * Memoised: every prop it takes is held at a stable reference by the
 * table, so a row re-renders for its own selection channel and for a
 * column model that actually changed, and for nothing else.
 */
export default memo(Row) as typeof Row;
