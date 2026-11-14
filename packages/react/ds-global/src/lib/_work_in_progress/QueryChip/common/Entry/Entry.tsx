import { type ReactElement, useContext, useId } from "react";
import QueryEntryContext from "../../../../common/QueryEntry/Context.js";
import type { QueryEntryInputProps } from "../../../../common/QueryEntry/types.js";
import useRovingItem from "../../../../common/Roving/hooks/useRovingItem.js";
import Context from "../Context.js";
import type { EntryProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip-entry";

/**
 * The part of a query chip being typed or edited: a text input, which a
 * combobox host, such as a query input with suggestions, drives through a
 * query entry provider. A chip has at most one.
 *
 * `import { QueryChip } from "@canonical/react-ds-global";`
 *
 * @implements ds:global_dataviews.subcomponent.query_chip-entry
 */
const Entry = ({
  value,
  onValueChange,
  label,
  placeholder,
  template,
  suffix,
  invalid,
  description,
}: EntryProps): ReactElement => {
  const chip = useContext(Context);
  const combobox = useContext(QueryEntryContext);
  const instanceId = useId();
  const rovingItem = useRovingItem({ id: `${chip.id}:entry` });
  const suffixId = suffix && `${instanceId}-suffix`;
  const descriptionId = description && `${instanceId}-description`;
  const inputProps: QueryEntryInputProps = {
    type: "text",
    className: "input",
    value,
    onChange: (event) => onValueChange(event.target.value),
    "aria-label": label,
    placeholder,
    "aria-invalid": invalid || undefined,
    "aria-describedby":
      [suffixId, descriptionId].filter(Boolean).join(" ") || undefined,
    disabled: chip.disabled,
    // In the tab order before scripts run; a roving item after.
    ...(chip.isMounted && rovingItem),
  };

  return (
    <span className={componentCssClassName} data-invalid={invalid || undefined}>
      <input
        {...(combobox ? combobox.getInputProps(inputProps) : inputProps)}
      />
      {template && (
        <span className="template" aria-hidden="true">
          {template}
        </span>
      )}
      {suffixId && (
        <span id={suffixId} className="suffix">
          {suffix}
        </span>
      )}
      {descriptionId && (
        <span id={descriptionId} className="assistive">
          {description}
        </span>
      )}
    </span>
  );
};

export default Entry;
