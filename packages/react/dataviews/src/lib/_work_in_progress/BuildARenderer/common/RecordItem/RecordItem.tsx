import { memo, type ReactElement } from "react";
import { useDataViewsValue } from "../../../../hooks/index.js";
import type { RecordItemProps } from "./types.js";

/**
 * One record of the list, with its checkbox when the list is selectable.
 * Memoised, so the list re-rendering leaves an unchanged item alone.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 *
 * @implements ds:apps.subcomponent.record_list-record_item
 */
const RecordItem = <TRow extends object>({
  channels,
  selection,
  nameRecord,
  selectable,
  messages,
  ...rest
}: RecordItemProps<TRow>): ReactElement => {
  // Each item reads its own row: a change to one record, or to whether it is
  // selected, re-renders that item alone.
  const record = useDataViewsValue(channels.record);
  const selected = useDataViewsValue(channels.selected);
  const name = nameRecord(record);
  return (
    <li {...rest}>
      {selectable ? (
        <input
          type="checkbox"
          aria-label={messages.selectRow(name)}
          checked={selected}
          onChange={() => {
            selection.toggle(channels.id);
          }}
        />
      ) : null}
      {name}
    </li>
  );
};

export default memo(RecordItem) as typeof RecordItem;
