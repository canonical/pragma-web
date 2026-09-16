import { memo, type ReactElement, useId } from "react";
import { useDataViewsValue, useLongPress } from "../../../../hooks/index.js";
import { readFieldName } from "../../../../utils/index.js";
import { BodyCell } from "../BodyCell/index.js";
import { SelectionCell } from "../SelectionCell/index.js";
import isWithinControl from "./isWithinControl.js";
import type { RowProps } from "./types.js";

const componentCssClassName = "ds data-table-row";

function Row<TRow extends object>({
  provider,
  channels,
  columns,
  rowHeader,
  selectable,
  selecting,
  onLongPress,
  onTap,
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
  // On touch, a long press selects the row and enters selection mode, where
  // a tap toggles it; a tap on one of the row's own controls is that
  // control's, and the row leaves it alone.
  const gestures = useLongPress({
    onLongPress: () => {
      onLongPress(channels.id);
    },
    onTap: (event) => {
      if (selecting && !isWithinControl(event.target)) {
        onTap(channels.id);
      }
    },
  });
  return (
    // aria-selected is only meaningful where selection is offered, and it
    // must agree with the row's checkbox: both read this one channel.
    // biome-ignore lint/a11y/useSemanticElements: <tr> is only valid inside a <table>, and this grid is deliberately not one
    // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, not a widget — the focusable controls live in its cells
    <div
      {...(selectable ? gestures : {})}
      ref={ref}
      role="row"
      className={componentCssClassName}
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
 * table's shared track list rather than a width per cell. Its selected state
 * is `aria-selected`, which the stylesheet selects by attribute, with no
 * class repeating it.
 *
 * Memoised: every prop it takes is held at a stable reference by the
 * table, so a row re-renders for its own selection channel, for a column
 * model that actually changed and for the table entering or leaving
 * selection mode, and for nothing else.
 */
export default memo(Row) as typeof Row;
