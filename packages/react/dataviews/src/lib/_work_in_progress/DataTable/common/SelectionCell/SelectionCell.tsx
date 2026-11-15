import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useDataViewsValue, useIsHydrated } from "../../../../hooks/index.js";
import type { SelectionCellProps } from "./types.js";

const componentCssClassName = "ds data-table-selection-cell";

/**
 * One row's selection checkbox: the design system's checkbox backed by the
 * provider's selection, named after the record rather than its position.
 *
 * @implements ds:apps.subcomponent.data_table-selection_cell
 */
export default function SelectionCell<TRow extends object>({
  provider,
  channels,
  selected,
  getRowLabel,
  className,
  ...rest
}: SelectionCellProps<TRow>): ReactElement {
  const messages = useContext(MessagesContext);
  const record = useDataViewsValue(channels.record);
  // Selection works once scripts run: until then the box draws disabled.
  const hydrated = useIsHydrated();
  return (
    <td
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CheckboxInput
        checked={selected}
        disabled={!hydrated}
        aria-label={messages.selectRow(getRowLabel(record, channels.id))}
        onChange={() => {
          provider.selection.toggle(channels.id);
        }}
      />
    </td>
  );
}
