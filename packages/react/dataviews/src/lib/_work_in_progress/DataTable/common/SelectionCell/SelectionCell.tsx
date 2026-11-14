import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useDataViewsValue } from "../../../../hooks/index.js";
import type { SelectionCellProps } from "./types.js";

const componentCssClassName = "ds data-table-selection-cell";

/**
 * One row's selection checkbox: the design system's checkbox backed by the
 * provider's selection, named after the record rather than its position.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-selection_cell
 */
export default function SelectionCell<TRow extends object>({
  provider,
  channels,
  selected,
  rowLabel,
  className,
  ...rest
}: SelectionCellProps<TRow>): ReactElement {
  const messages = useContext(MessagesContext);
  const record = useDataViewsValue(channels.record);
  return (
    // biome-ignore lint/a11y/useSemanticElements: <td> is only valid inside a <table>, and this grid is deliberately not one
    <div
      {...rest}
      role="cell"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CheckboxInput
        checked={selected}
        aria-label={messages.selectRow(rowLabel(record, channels.id))}
        onChange={() => {
          provider.selection.toggle(channels.id);
        }}
      />
    </div>
  );
}
