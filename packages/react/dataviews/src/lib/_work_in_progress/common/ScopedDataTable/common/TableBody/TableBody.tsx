import { Fragment, memo, type ReactElement } from "react";
import type { TableBodyProps } from "./types.js";

const componentCssClassName = "ds data-table-body";

/**
 * Every entry the table displays, in order, re-rendered only for new
 * entries or a new renderer.
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
