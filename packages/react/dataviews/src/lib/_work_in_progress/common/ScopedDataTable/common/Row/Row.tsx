import { memo, type ReactElement } from "react";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../hooks/index.js";
import { readFieldName } from "../../../../../utils/index.js";
import { BodyCell } from "../BodyCell/index.js";
import { SelectionCell } from "../SelectionCell/index.js";
import type { RowProps } from "./types.js";

const componentCssClassName = "ds data-table-row";

/**
 * One data row. It observes its own selection membership — a selection
 * change reaches only the rows whose membership moved — and consumes the
 * table's shared track list rather than a width per cell.
 *
 * Memoised: every prop it takes is held at a stable reference by the
 * table, so a row re-renders for its own selection channel and for a
 * column model that actually changed, and for nothing else.
 *
 * @implements ds:apps.subcomponent.data_table-row
 */
const Row = <TRow extends object>({
  provider,
  channels,
  columns,
  selectable,
  getRowLabel,
  position,
  gap,
  ref,
}: RowProps<TRow>): ReactElement => {
  const selected = useDataViewsValue(channels.selected);
  const hydrated = useIsHydrated();
  return (
    // aria-selected only where selection works: offered, and scripts run.
    // It agrees with the row's checkbox, as both read this one channel, and
    // the stylesheet tints the row by it.
    <tr
      ref={ref}
      className={componentCssClassName}
      aria-selected={selectable && hydrated ? selected : undefined}
      aria-rowindex={position}
      style={gap === undefined ? undefined : { marginBlockStart: gap }}
    >
      {selectable ? (
        <SelectionCell
          provider={provider}
          channels={channels}
          selected={selected}
          getRowLabel={getRowLabel}
        />
      ) : null}
      {columns.map((column) => (
        <BodyCell
          key={column.id}
          provider={provider}
          channels={channels}
          column={column}
          field={readFieldName(column)}
        />
      ))}
    </tr>
  );
};

export default memo(Row) as typeof Row;
