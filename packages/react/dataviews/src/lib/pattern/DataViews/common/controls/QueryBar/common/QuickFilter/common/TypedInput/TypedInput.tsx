import type { SourceRefusal } from "@canonical/dataviews-core";
import { spellWireKey } from "@canonical/dataviews-core/bindings";
import { DateInput, TextInput } from "@canonical/react-ds-global-form";
import type { ChangeEvent, KeyboardEvent, ReactElement } from "react";
import { useId, useRef, useState } from "react";
import { useIsHydrated } from "../../../../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../../../../hooks/index.js";
import type { TypedInputProps } from "./types.js";
import "./styles.css";
import { spellOperand } from "../../../../utils/index.js";

const componentCssClassName = "ds data-views-quick-filter-typed";

/**
 * One typed value of a quick filter's panel: a labelled input showing the
 * value that applies at its address, a number in its largest display unit
 * with the reader's decimal separator, a date in a native date input. Enter,
 * or leaving the input, commits what was typed as one transition; emptied,
 * it removes the value. A value that does not read keeps the one that
 * applied: the input is marked invalid and described by why, until it is
 * typed again, and each commit that fails says why. A date with a part
 * cleared or half typed is incomplete, not a removal. Escape abandons what
 * is typed, and the input shows what applies again. Before scripts, in a
 * form, a number shows with a point, as the wire reads it.
 */
export default function TypedInput({
  definition,
  operator,
  label,
  standing,
  hintId,
  group,
  named,
  onCommit,
  onInvalid,
}: TypedInputProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { field } = definition;
  const hydrated = useIsHydrated();
  // Before scripts, the form submits the value as it shows, and the wire
  // reads a point: the reader's separator waits for scripts.
  const decimalSeparator = named && !hydrated ? "." : messages.decimalSeparator;
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const errorId = `${baseId}-error`;
  // What is typed while it differs from what applies; null shows that.
  const [typed, setTyped] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  // Escape abandons what is typed: the blur that follows commits nothing.
  const abandonedRef = useRef(false);
  // A date with a part cleared or half typed reads as empty, which is not a
  // removal.
  const unreadableRef = useRef(false);
  const applied = standing?.predicate.operands.at(0);
  const shown =
    typed ??
    (applied === undefined
      ? ""
      : spellOperand(definition, applied, decimalSeparator));

  /** Commit what is typed, unless nothing is. */
  const commit = (): void => {
    if (abandonedRef.current) {
      abandonedRef.current = false;
      return;
    }
    if (typed === null) return;
    const text = typed.trim();
    const retained = standing !== undefined;
    let refusals: readonly SourceRefusal[];
    if (text === "" && unreadableRef.current) {
      const message = messages.filterIncomplete(retained);
      setInvalid(message);
      onInvalid(message);
      return;
    }
    if (text === "") {
      // Emptied with nothing standing, there is nothing to commit.
      if (standing === undefined) {
        setTyped(null);
        return;
      }
      refusals = group.removePredicate(standing.ref);
    } else {
      const read = provider.collection.schema.validateInput(
        field,
        text,
        decimalSeparator,
      );
      if (read.status !== "valid") {
        const message =
          read.status === "invalid"
            ? messages.filterRefused({
                reasons: [messages.clauseInvalid(read.reason)],
                retained,
              })
            : messages.filterIncomplete(retained);
        setInvalid(message);
        // An input's description is not read again while it keeps focus,
        // so each commit that fails says why.
        onInvalid(message);
        return;
      }
      refusals = group.setPredicate(
        { field, operator, operands: read.operands },
        0,
      );
    }
    onCommit(refusals);
    setTyped(null);
  };

  const describedBy =
    [hintId, invalid === null ? undefined : errorId]
      .filter((id) => id !== undefined)
      .join(" ") || undefined;
  const inputProps = {
    ...(named ? { name: spellWireKey(field, operator) } : {}),
    value: shown,
    "aria-labelledby": labelId,
    "aria-invalid": invalid === null ? undefined : true,
    "aria-describedby": describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      abandonedRef.current = false;
      unreadableRef.current = event.target.validity.badInput;
      setTyped(event.target.value);
      setInvalid(null);
    },
    onBlur: commit,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        // Left unprevented, so the panel still closes.
        abandonedRef.current = true;
        unreadableRef.current = false;
        setTyped(null);
        setInvalid(null);
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      commit();
    },
  };

  return (
    <div className={componentCssClassName}>
      {/* A text input's id goes to its wrapper, so the input is named by
          the label's id. */}
      <div className="field">
        <span id={labelId} className="label">
          {label}
        </span>
        {definition.kind === "date" ? (
          <DateInput {...inputProps} />
        ) : (
          <TextInput
            {...inputProps}
            {...(definition.kind === "number" ? { inputMode: "decimal" } : {})}
          />
        )}
      </div>
      {invalid !== null && (
        <p id={errorId} className="error">
          {invalid}
        </p>
      )}
    </div>
  );
}
