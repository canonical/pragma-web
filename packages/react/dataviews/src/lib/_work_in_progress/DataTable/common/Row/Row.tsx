import { memo, type ReactElement, useId, useMemo } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import { BodyCell } from "../BodyCell/index.js";
import { SelectionCell } from "../SelectionCell/index.js";
import type { RowProps } from "./types.js";

const componentCssClassName = "ds data-table-row";

function Row<TRow extends object>({
  provider,
  channels,
  columns,
  selectable,
  nameRecord,
  position,
  ref,
  decideApplicability,
}: RowProps<TRow>): ReactElement {
  const selected = useDataViewsValue(channels.selected);
  // The row is named by its header cell where a column is the row header:
  // a reader hears the name before each of the row's other cells.
  const headerId = useId();
  // Which columns apply to the record is a fact about its type, so the row
  // watches the type alone: it renders again when a record comes back as
  // another type, and for no move of any field.
  const type = useDataViewsValue(channels.type);
  // The column heading the row, if any; the table checked there is one at
  // most where it mounted.
  const rowHeader = useMemo(
    () => columns.find((column) => column.rowHeader === true) ?? null,
    [columns],
  );
  return (
    // aria-selected is only meaningful where selection is offered, and it
    // must agree with the row's checkbox: both read this one channel.
    // biome-ignore lint/a11y/useSemanticElements: <tr> is only valid inside a <table>, and this grid is deliberately not one
    // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, not a widget — the focusable controls live in its cells
    <div
      ref={ref}
      role="row"
      className={componentCssClassName}
      aria-selected={selectable ? selected : undefined}
      aria-rowindex={position}
      aria-labelledby={rowHeader === null ? undefined : headerId}
      // Where the table's touch gestures find the row they landed on.
      data-row-id={selectable ? channels.id : undefined}
    >
      {selectable ? (
        <SelectionCell
          provider={provider}
          channels={channels}
          selected={selected}
          nameRecord={nameRecord}
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
          applicability={decideApplicability(column, type)}
        />
      ))}
    </div>
  );
}

/**
 * One data row. It observes its own selection membership — a selection
 * change reaches only the rows whose membership moved — and consumes the
 * table's shared track list rather than a width per cell. Its selected state
 * is `aria-selected`, which the stylesheet selects by attribute, with no
 * class repeating it.
 *
 * Memoised: every prop it takes is held at a stable reference by the
 * table, so a row re-renders for its own selection channel, for its record's
 * type, and for a column model that actually changed, and for nothing else.
 * It holds no gesture of its own: a long press is the table's, found by the
 * row's id.
 */
export default memo(Row) as typeof Row;
