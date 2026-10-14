import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import type { SelectEventProps } from "./types.js";

/**
 * One event's checkbox, backed by the collection's selection: checking it
 * selects the record in every renderer on the provider. It alone reads the
 * record's membership, so a selection re-renders no event.
 */
export default function SelectEvent({
  selection,
  rowId,
  name,
}: SelectEventProps): ReactElement {
  const messages = useContext(MessagesContext);
  const selected = useDataViewsValue(selection.state, (state) =>
    state.ids.has(rowId),
  );
  return (
    <CheckboxInput
      className="select"
      checked={selected}
      aria-label={messages.selectRow(name)}
      onChange={() => {
        selection.toggle(rowId);
      }}
    />
  );
}
