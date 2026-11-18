import { type ReactElement, useContext } from "react";
import {
  type QueryEntryInputProps,
  useQueryEntry,
  useRovingItem,
} from "../../../../common/index.js";
import Context from "../Context.js";
import type { EntryProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip-entry";

/**
 * The part of a query chip being typed or edited: a text input inside the
 * chip, where its field, operator or value is chosen. A chip holds at most
 * one. When a part is settled, the host replaces the Entry with a Segment,
 * or moves it to the next part.
 *
 * @implements ds:global_dataviews.subcomponent.query_chip-entry
 */
const Entry = ({
  value,
  onValueChange,
  label,
  placeholder,
  template,
  formatDescription,
  suffix,
  invalid,
  description,
  className,
  ref,
  onFocus,
  onClick,
  "aria-describedby": hostDescribedBy,
  ...props
}: EntryProps): ReactElement | null => {
  const part = useContext(Context);
  const combobox = useQueryEntry();
  // The host's ref and handlers are kept.
  const rovingItem = useRovingItem<HTMLInputElement>({
    id: part.isItem ? `${part.id}:entry` : undefined,
    ref,
    onFocus,
    onClick,
  });

  // An Entry renders only once scripts run: without them nothing can parse
  // what is typed.
  if (!part.isMounted) return null;

  const formatId = formatDescription && `${part.descriptionId}-format`;
  const descriptionId = invalid ? part.descriptionId : undefined;
  const inputProps: QueryEntryInputProps = {
    ...props,
    ref,
    onFocus,
    onClick,
    type: "text",
    className: ["input", className].filter(Boolean).join(" "),
    value,
    onChange: (event) => onValueChange(event.target.value),
    "aria-label": label,
    placeholder,
    "aria-invalid": invalid || undefined,
    // The format in words always comes first, then the fault, then the
    // host's own.
    "aria-describedby":
      [formatId, descriptionId, hostDescribedBy].filter(Boolean).join(" ") ||
      undefined,
    disabled: part.disabled,
    ...rovingItem,
  };

  return (
    <span className={componentCssClassName} data-invalid={invalid || undefined}>
      <input
        {...(combobox ? combobox.getInputProps(inputProps) : inputProps)}
      />
      {template && (
        // What is typed holds its place, so the rest of the template shows
        // after it.
        <span className="template" aria-hidden="true">
          <span className="typed">{value}</span>
          {template.slice(value.length)}
        </span>
      )}
      {suffix && <span className="suffix">{suffix}</span>}
      {/* Spoken through the input's description only, not twice. */}
      {formatId && (
        <span id={formatId} hidden>
          {formatDescription}
        </span>
      )}
      {invalid && (
        <span id={descriptionId} hidden>
          {description}
        </span>
      )}
    </span>
  );
};

export default Entry;
