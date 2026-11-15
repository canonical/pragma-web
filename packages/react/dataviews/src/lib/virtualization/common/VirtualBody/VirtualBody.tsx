import { Fragment, memo, type ReactElement } from "react";
import { useDataViewsValue } from "../../../hooks/index.js";
import { useVirtualRows } from "../../hooks/index.js";
import type { VirtualBodyProps } from "./types.js";

const componentCssClassName = "ds data-table-body";

/**
 * The table's body, virtualized: the entries near the viewport at their
 * logical positions, with the space of the rest as its padding and as the
 * top margin of a later run's first row.
 *
 * @implements ds:apps.subcomponent.data_table-body
 */
const VirtualBody = ({
  entries,
  renderEntry,
  rows: rowModel,
  estimatedRowHeight,
  tracks,
}: VirtualBodyProps): ReactElement => {
  const model = useDataViewsValue(rowModel);
  const { mounted, body, readRowRef, onFocus, onBlur } = useVirtualRows({
    entries,
    estimatedRowHeight,
    model,
    tracks,
  });
  // One flat list, keyed by entry id, so a row keeps its element as it
  // moves between runs. The space before the first run and after the last
  // is the body's block padding; the space between runs is the top margin
  // of the later run's first row.
  const rows: ReactElement[] = [];
  let before = 0;
  for (const [position, run] of mounted.runs.entries()) {
    if (position === 0) {
      before = run.before;
    }
    for (const [offset, entry] of entries.slice(run.start, run.end).entries()) {
      rows.push(
        <Fragment key={entry.id}>
          {renderEntry(entry, {
            ref: readRowRef(entry.id),
            position: entry.index,
            gap:
              position > 0 && offset === 0 && run.before > 0
                ? run.before
                : undefined,
          })}
        </Fragment>,
      );
    }
  }
  return (
    <tbody
      ref={body}
      className={componentCssClassName}
      style={
        before === 0 && mounted.after === 0
          ? undefined
          : {
              paddingBlockStart: before === 0 ? undefined : before,
              paddingBlockEnd: mounted.after === 0 ? undefined : mounted.after,
            }
      }
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {rows}
    </tbody>
  );
};

export default memo(VirtualBody) as typeof VirtualBody;
