import { spellWireKey } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { type ReactElement, useEffect, useId, useRef, useState } from "react";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../../hooks/index.js";
import { useDataViewsRoot, useFilterHandle } from "../../../../hooks/index.js";
import { PHRASE_MESSAGES } from "../constants.js";
import { describeFilterFeedback } from "../utils/index.js";
import type { TextFilterOperator, TextFilterProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-filters-text";

/**
 * The operator a control starts on while no text stands, where the source
 * declares it: the match a reader typing into a field expects.
 */
const FIRST_OPERATOR: TextFilterOperator = "contains";

/**
 * One text filter: the text a text field must match, and how it matches —
 * equal to it, differing from it, holding or lacking it, starting or ending
 * with it.
 *
 * A labelled native text input named as the wire spells the clause,
 * `<field>__<operator>`, so a GET submission before any script runs is the
 * same destination the edit writes; the server's decoder reads it back as
 * the predicate. Once scripting is enabled each edit applies as it
 * is typed, and a select beside the input chooses how it matches, among the
 * operators the source declares that no other control of the field edits,
 * starting on contains where it is one:
 * moving standing text keeps it, as one step. Emptying the input is
 * incomplete, not a removal: the applied text stays until it is cleared,
 * which is what the clear control is for; at baseline an emptied input
 * submits no clause. Clearing moves focus to the input while the control
 * stays, and to the filters' group when it leaves with the text. What the
 * source refused, and why, is said beside the input.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_views_filters-text_filter
 */
export default function TextFilter({
  standing,
  offered,
  taken,
  findHandle,
  label,
  field: fieldName,
  host,
  leavesWhenCleared,
  onLeave,
  onMoved,
  takeMoved,
  className,
  ...rest
}: TextFilterProps): ReactElement {
  const { messages, endSessions } = useDataViewsRoot("Filters");
  const hydrated = useIsHydrated();
  // How the control matches while no text stands: the reader's choice.
  const [chosen, setChosen] = useState<TextFilterOperator | null>(null);
  const operator =
    standing ??
    [chosen, FIRST_OPERATOR].find(
      (candidate) => candidate !== null && offered.includes(candidate),
    ) ??
    offered.at(0);
  if (operator === undefined) {
    throw new Error(`text field "${fieldName}" has no operator to edit`);
  }
  const handle = findHandle(operator);
  const field = useFilterHandle(handle);
  const nth = useDataViewsValue(handle.nth);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  // Text moved here from another control's choice: the choice's focus
  // follows it, wherever the move placed this control.
  useEffect(() => {
    if (standing !== null && takeMoved(standing)) {
      selectRef.current?.focus();
    }
  }, [standing, takeMoved]);
  const retained = field.applied.kind === "value";
  const declared = offered.includes(operator);
  const feedbackId = `${inputId}-feedback`;
  const message = describeFilterFeedback(field.feedback, retained, messages);
  const name = messages[PHRASE_MESSAGES[operator]](label);
  /** Match by another operator: standing text moves to it as one step. */
  const choose = (next: TextFilterOperator): void => {
    setChosen(next);
    if (field.applied.kind === "value") {
      onMoved(next);
      host.editPredicates(
        [{ field: fieldName, operator, nth }],
        [{ field: fieldName, operator: next, operands: [field.applied.value] }],
      );
    }
  };
  return (
    <div
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <label htmlFor={inputId} className="label">
        {name}
      </label>
      {/* Drawn once scripts run: before then a choice could not rename the
          input the form submits. Undeclared, the text is only removed, and
          one operator leaves nothing to choose. */}
      {hydrated && declared && offered.length > 1 ? (
        <select
          ref={selectRef}
          className="operator"
          aria-label={messages.filterMatch(label)}
          value={operator}
          onChange={(event) => {
            choose(event.target.value as TextFilterOperator);
          }}
        >
          {offered.map((candidate) => (
            <option
              key={candidate}
              value={candidate}
              disabled={candidate !== operator && taken.includes(candidate)}
            >
              {messages[PHRASE_MESSAGES[candidate]](label)}
            </option>
          ))}
        </select>
      ) : null}
      <input
        ref={inputRef}
        id={inputId}
        className="input"
        type="text"
        name={spellWireKey(fieldName, operator)}
        value={field.input}
        // Undeclared, the text can only be cleared, never replaced.
        readOnly={!declared}
        aria-invalid={
          field.feedback.status === "invalid" ||
          field.feedback.status === "refused"
        }
        aria-describedby={message === null ? undefined : feedbackId}
        onChange={(event) => {
          field.edit(event.target.value);
        }}
        // Leaving the input ends its session: typing again is a new step.
        onBlur={endSessions}
      />
      {retained ? (
        <Button
          type="button"
          importance="tertiary"
          className="clear"
          onClick={() => {
            field.clear();
            // The control with focus leaves with the text, or another takes
            // its place, so its parent places focus; otherwise the input
            // stays, and focus goes there.
            if (!leavesWhenCleared) {
              inputRef.current?.focus();
            } else {
              onLeave();
            }
          }}
        >
          {messages.clearFilter(name)}
        </Button>
      ) : null}
      {/* Mounted even when empty, so a message appearing is announced. */}
      <p id={feedbackId} className="feedback" role="status">
        {message}
      </p>
    </div>
  );
}
