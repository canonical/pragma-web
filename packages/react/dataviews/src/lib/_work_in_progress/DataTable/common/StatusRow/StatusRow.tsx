import { DISPLAY_STATUS_PHASES } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import type { StatusRowProps } from "./types.js";

const componentCssClassName = "ds data-table-row status";

/** The one cell of the status row shares the body cell's box. */
const cellCssClassName = "ds data-table-body-cell status";

/**
 * The table's status row: one cell for the whole table, saying why there
 * are no rows or, above rows kept in view, what stands over them. The cell
 * carries the status as `data-status`, which the stylesheet reads. A
 * settled outcome is a polite status message — nothing on screen moves
 * when rows are kept, so nothing else would say so — and a passing state
 * is silent.
 */
export default function StatusRow({
  status,
  renderStatus,
  span,
  position,
  ref,
}: StatusRowProps): ReactElement {
  return (
    <tr ref={ref} className={componentCssClassName} aria-rowindex={position}>
      <td
        className={cellCssClassName}
        colSpan={span}
        data-status={status.status}
      >
        {DISPLAY_STATUS_PHASES[status.status] === "terminal" ? (
          <span role="status">{renderStatus(status)}</span>
        ) : (
          renderStatus(status)
        )}
      </td>
    </tr>
  );
}
