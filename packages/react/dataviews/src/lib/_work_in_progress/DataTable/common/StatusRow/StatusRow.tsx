import { DISPLAY_STATUS_PHASES } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import type { StatusRowProps } from "./types.js";

const componentCssClassName = "ds data-table-status-row";

/**
 * The table's status row: one cell for the whole table, saying why there
 * are no rows or, above rows kept in view, what stands over them. The row
 * carries the status as `data-status`. A settled outcome is a polite status
 * message; a passing state is silent.
 */
export default function StatusRow({
  status,
  renderStatus,
  span,
  position,
  ref,
}: StatusRowProps): ReactElement {
  return (
    <tr
      ref={ref}
      className={componentCssClassName}
      data-status={status.status}
      aria-rowindex={position}
    >
      <td className="cell" colSpan={span}>
        {DISPLAY_STATUS_PHASES[status.status] === "terminal" ? (
          <span role="status">{renderStatus(status)}</span>
        ) : (
          renderStatus(status)
        )}
      </td>
    </tr>
  );
}
