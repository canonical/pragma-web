import { Fragment, memo, type ReactElement } from "react";
import type { TableBodyProps } from "./types.js";

const componentCssClassName = "ds data-table-body";

/**
 * Every entry the table displays, in order. Memoised, and both props are
 * held at one reference — the entries until a row identity or the status
 * changes, the renderer until what it closes over does — so a republication
 * that changes only the query or the request status re-renders the header
 * and stops there. While a status shows, a new `renderStatus` re-renders
 * the body, which costs the status row and, beside kept rows, one pass over
 * memoised rows that bail out.
 *
 * @implements ds:apps.subcomponent.data_table-body
 */
const TableBody = ({ entries, renderEntry }: TableBodyProps): ReactElement => (
  <tbody className={componentCssClassName}>
    {entries.map((entry) => (
      <Fragment key={entry.id}>{renderEntry(entry)}</Fragment>
    ))}
  </tbody>
);

export default memo(TableBody);
