import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import {
  useDataViewsValue,
  useSelectAllOnPage,
} from "../../../../hooks/index.js";
import type { SelectAllCellProps } from "./types.js";

const componentCssClassName = "ds data-table-select-all-cell";

/**
 * The select-all checkbox. Its scope is the displayed rows, which its name
 * says: it adds and removes exactly those identities and leaves a selection
 * made elsewhere in the collection alone.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-select_all_cell
 */
export default function SelectAllCell({
  selection,
  ids: displayed,
  reserve,
  className,
  ...rest
}: SelectAllCellProps): ReactElement {
  const messages = useContext(MessagesContext);
  const ids = useDataViewsValue(displayed);
  const { checked, mixed, toggle } = useSelectAllOnPage({ selection, ids });
  return (
    // biome-ignore lint/a11y/useSemanticElements: <th> is only valid inside a <table>, and this grid is deliberately not one
    // biome-ignore lint/a11y/useFocusableInteractive: the header is structure, not a widget — its checkbox carries the focus
    <div
      {...rest}
      role="columnheader"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      ref={reserve}
    >
      <CheckboxInput
        checked={checked}
        aria-label={messages.selectAllRows}
        ref={(node) => {
          if (node !== null) {
            node.indeterminate = mixed;
          }
        }}
        onChange={toggle}
      />
    </div>
  );
}
