import { CheckboxInput } from "@canonical/react-ds-global-form";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../../../common/index.js";
import type { NamedCheckboxProps } from "./types.js";

const componentCssClassName = "ds data-table-body-cell selection";

/** A row's selection cell and its checkbox, once the row's name is known. */
export default function NamedCheckbox<TRow extends object>({
  provider,
  channels,
  selected,
  name,
}: NamedCheckboxProps<TRow>): ReactElement {
  const messages = useContext(MessagesContext);
  return (
    // biome-ignore lint/a11y/useSemanticElements: <td> is only valid inside a <table>, and this grid is deliberately not one
    <div role="cell" className={componentCssClassName}>
      <CheckboxInput
        checked={selected}
        aria-label={messages.selectRow(name)}
        onChange={() => {
          provider.selection.toggle(channels.id);
        }}
      />
    </div>
  );
}
