import type {
  Predicate,
  PredicateOperand,
  PredicateOperator,
} from "@canonical/dataviews-core";
import { listConjuncts } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
} from "react";
import { useDataViewsRoot } from "../../../../../../../hooks/index.js";
import { useSuggestedFacets } from "../../../../hooks/index.js";
import type {
  DataViewsQueryBarPreset,
  QueryBarOption,
  QueryGroupStandIn,
} from "../../../../types.js";
import {
  entryFormat,
  listChipClauses,
  readLabelsStandIn,
  speakClause,
  suggestOptions,
} from "../../../../utils/index.js";
import { StepListbox } from "../StepListbox/index.js";
import { useWalk } from "./hooks/index.js";
import type { AddFilterWalkProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-add-filter-walk";

/** The walk offers no presets: each value is chosen or typed. */
const NO_PRESETS: readonly DataViewsQueryBarPreset[] = Object.freeze([]);

/** No option chosen. */
const NO_SELECTION: ReadonlySet<string> = new Set();

/** Two operand lists holding the same values, in any order. */
const isSameSet = (
  a: readonly PredicateOperand[],
  b: readonly PredicateOperand[],
): boolean =>
  a.length === b.length && a.every((operand) => b.includes(operand));

/** Whether a conjunct asks what another does, its values in any order. */
const isSameConjunct = (a: Predicate, b: Predicate): boolean =>
  a.field === b.field &&
  a.operator === b.operator &&
  isSameSet(a.operands, b.operands);

/**
 * The id of the chip a conjunct stands in: its own, or the range it is a
 * bound of.
 */
const findChipId = (
  group: QueryGroupStandIn,
  predicate: Predicate,
): string | undefined =>
  listChipClauses(group.state.get()).find(
    (clause) =>
      (clause.kind === "predicate" &&
        isSameConjunct(clause.predicate, predicate)) ||
      (clause.kind === "range" &&
        (isSameConjunct(clause.lower, predicate) ||
          isSameConjunct(clause.upper, predicate))),
  )?.id;

/**
 * The sheet's "Add filter": a button that walks field, operator and value
 * as full-width lists inside the sheet, one step at a time, and adds the
 * filter once it is complete. Each list is a listbox named by its step,
 * offering what the bar's suggestions offer; a typed value is a labelled
 * input with its format, and an Add button, as several values are. Focus
 * moves to the first option of each new step, and each step taken is
 * said. Back returns a step, or leaves from the first; Escape leaves the
 * walk, never the sheet. Leaving drops the filter being built and returns
 * focus to "Add filter". Once added, focus moves to the new chip's remove
 * control, and the clause and the count are said.
 */
export default function AddFilterWalk({
  group,
  announceOutcome,
  onAdded,
}: AddFilterWalkProps): ReactElement {
  // Inside the sheet, the root's announcer is the sheet's own region.
  const { provider, messages, announce } = useDataViewsRoot("QueryBar");
  const { schema } = provider.collection;
  const { capabilities } = provider;
  const labels = readLabelsStandIn();
  const { walk, dispatch } = useWalk();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  // Whether leaving the walk returns focus to "Add filter": not once the
  // filter is added, when focus goes to its chip.
  const refocusRef = useRef(false);
  const definition =
    walk.field === null ? undefined : schema.findField(walk.field);
  const label = walk.field === null ? "" : labels.readFieldLabel(walk.field);
  const isListedValue = walk.step === "value" && definition?.kind === "choices";
  const facets = useSuggestedFacets({
    provider,
    field: isListedValue ? walk.field : null,
  });
  const { step } = walk;
  const isOpen = step !== "closed";
  // A choice whose options are the server's lists none until the first
  // result lands with them: the step says it is loading meanwhile.
  const isLoading =
    isListedValue &&
    definition?.kind === "choices" &&
    definition.options === undefined &&
    facets.latest === null;

  // Closed by Back from the first step, Escape or the dialog's cancel,
  // focus returns to "Add filter".
  // @note Impure: moves focus.
  useEffect(() => {
    if (isOpen || !refocusRef.current) return;
    refocusRef.current = false;
    rootRef.current?.querySelector<HTMLElement>(".add")?.focus();
  }, [isOpen]);

  // A typed value's input takes focus as its step opens.
  // @note Impure: moves focus.
  useEffect(() => {
    if (step === "value") inputRef.current?.focus();
  }, [step]);

  // The dialog's close request, as from the back gesture, leaves the walk
  // instead of the sheet while it is open.
  // @note Impure: listens to the dialog's cancel.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = rootRef.current?.closest("dialog");
    if (!dialog) return;
    const handleCancel = (event: Event): void => {
      event.preventDefault();
      refocusRef.current = true;
      dispatch({ type: "leave" });
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [isOpen, dispatch]);

  /** The step's options, as the bar's suggestions read them. */
  const listOptions = (
    part: "field" | "operator" | "value",
  ): readonly QueryBarOption[] =>
    suggestOptions({
      part,
      // The field step marks nothing held, so the field chosen before Back
      // stays choosable, marked selected.
      draft:
        part === "field" || walk.field === null
          ? null
          : {
              kind: "predicate",
              origin: null,
              field: walk.field,
              operator: part === "value" ? walk.operator : null,
              // The values chosen are marked selected, not held.
              operands: [],
            },
      typed: "",
      schema,
      capabilities,
      messages,
      labels,
      facets,
      presets: NO_PRESETS,
      presetFilter: "",
    });

  /** Leave the walk, the filter being built dropped. */
  const leave = (): void => {
    refocusRef.current = true;
    dispatch({ type: "leave" });
  };

  /** Mark what cannot apply, and say it. */
  const markInvalid = (text: string): void => {
    dispatch({ type: "invalid", reason: text });
    announce(text);
  };

  /** Add the filter, unless the query holds it already, and move on. */
  const add = (
    field: string,
    operator: PredicateOperator,
    operands: readonly PredicateOperand[],
  ): void => {
    const predicate: Predicate = { field, operator, operands };
    const isHeld = listConjuncts(group.state.get().slice, field, operator).some(
      (conjunct) => isSameSet(conjunct.operands, operands),
    );
    if (!isHeld) {
      const refusals = group.addPredicate(predicate);
      if (refusals.length > 0) {
        markInvalid(
          messages.filterRefused(
            refusals.map(({ reason }) => reason),
            false,
          ),
        );
        return;
      }
      const spoken = speakClause(
        { kind: "predicate", origin: null, ...predicate },
        schema,
        labels,
        messages,
      );
      announceOutcome((count) =>
        messages.clauseAdded(spoken, count, labels.recordNoun),
      );
    }
    dispatch({ type: "leave" });
    const id = findChipId(group, predicate);
    /* v8 ignore next -- unreachable: the conjunct just written, or held, stands in a chip */
    if (id !== undefined) onAdded(id);
  };

  /** Add the values chosen, or the value typed, once Add is pressed. */
  const addValue = (): void => {
    /* v8 ignore next -- unreachable: the value step follows a field and an operator */
    if (walk.field === null || walk.operator === null) return;
    if (isListedValue) {
      if (walk.operands.length === 0) {
        markInvalid(messages.filterIncomplete(false));
        return;
      }
      add(walk.field, walk.operator, walk.operands);
      return;
    }
    const read = schema.validateInput(
      walk.field,
      walk.typed,
      messages.decimalSeparator,
    );
    if (read.status !== "valid") {
      markInvalid(
        read.status === "invalid"
          ? messages.clauseInvalid(read.reason)
          : messages.filterIncomplete(false),
      );
      return;
    }
    add(walk.field, walk.operator, read.operands);
  };

  /** A step's option chosen: the next step, or the filter added. */
  const choose = (option: QueryBarOption): void => {
    const { choice } = option;
    switch (choice.kind) {
      case "field": {
        const chosen = labels.readFieldLabel(choice.field);
        dispatch({ type: "chooseField", field: choice.field });
        announce(
          messages.filterStepChosen({
            chosen,
            step: messages.chooseOperator({ label: chosen }),
          }),
        );
        return;
      }
      case "operator":
        /* v8 ignore next -- unreachable: an operator is offered once a field is chosen */
        if (walk.field === null) return;
        // An operator that brings its value, as presence does, completes it.
        if (choice.operands !== null) {
          add(walk.field, choice.operator, choice.operands);
          return;
        }
        dispatch({ type: "chooseOperator", operator: choice.operator });
        announce(
          messages.filterStepChosen({
            chosen: option.label,
            step: messages.chooseValue({ label }),
          }),
        );
        return;
      case "value":
        dispatch({ type: "toggleValue", operand: choice.operand });
        return;
    }
  };

  /** Escape leaves the walk, its default prevented so the sheet stays. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    leave();
  };

  if (!isOpen) {
    return (
      <div ref={rootRef} className={componentCssClassName}>
        <Button
          type="button"
          importance="secondary"
          className="add"
          onClick={() => {
            dispatch({ type: "open" });
            announce(messages.chooseField);
          }}
        >
          {messages.addFilter}
        </Button>
      </div>
    );
  }

  const stepName =
    step === "field"
      ? messages.chooseField
      : step === "operator"
        ? messages.chooseOperator({ label })
        : messages.chooseValue({ label });
  const invalidId = `${baseId}-invalid`;
  const formatId = `${baseId}-format`;
  const format = entryFormat(definition, "value", walk.typed, messages);

  const renderValue = (): ReactElement =>
    isListedValue ? (
      <StepListbox
        key="value"
        label={stepName}
        options={listOptions("value")}
        selected={new Set(walk.operands.map(String))}
        multiple
        emptyText={
          isLoading ? messages.loadingSuggestions : messages.noSuggestions
        }
        aria-busy={isLoading || undefined}
        onChoose={(option) => choose(option as QueryBarOption)}
        aria-describedby={walk.invalid === null ? undefined : invalidId}
      />
    ) : (
      <div className="typed">
        <label className="label" htmlFor={`${baseId}-input`}>
          {messages.clauseValue(label)}
        </label>
        <input
          ref={inputRef}
          id={`${baseId}-input`}
          className="input"
          type="text"
          value={walk.typed}
          placeholder={format.template}
          aria-invalid={walk.invalid === null ? undefined : true}
          aria-describedby={
            [
              format.formatDescription === undefined ? null : formatId,
              walk.invalid === null ? null : invalidId,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) =>
            dispatch({ type: "type", text: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            addValue();
          }}
        />
        {format.formatDescription !== undefined && (
          <span id={formatId} className="format">
            {format.formatDescription}
          </span>
        )}
      </div>
    );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the walk hears Escape from the step that has focus
    <div
      ref={rootRef}
      className={[componentCssClassName, "open"].join(" ")}
      onKeyDown={handleKeyDown}
    >
      <div className="bar">
        <Button
          type="button"
          importance="tertiary"
          className="back"
          onClick={() => {
            refocusRef.current = step === "field";
            dispatch({ type: "back" });
            // The step returned to is said, as each step taken is.
            if (step === "value") announce(messages.chooseOperator({ label }));
            if (step === "operator") announce(messages.chooseField);
          }}
        >
          {messages.goBack}
        </Button>
        <span className="step">{stepName}</span>
      </div>
      {step === "field" && (
        <StepListbox
          key="field"
          label={stepName}
          options={listOptions("field")}
          selected={walk.field === null ? NO_SELECTION : new Set([walk.field])}
          emptyText={messages.noSuggestions}
          onChoose={(option) => choose(option as QueryBarOption)}
        />
      )}
      {step === "operator" && (
        <StepListbox
          key="operator"
          label={stepName}
          options={listOptions("operator")}
          selected={
            walk.operator === null ? NO_SELECTION : new Set([walk.operator])
          }
          emptyText={messages.noSuggestions}
          onChoose={(option) => choose(option as QueryBarOption)}
        />
      )}
      {step === "value" && renderValue()}
      {walk.invalid !== null && (
        <span id={invalidId} className="invalid">
          {walk.invalid}
        </span>
      )}
      {step === "value" && (
        <Button
          type="button"
          importance="primary"
          className="commit"
          onClick={addValue}
        >
          {messages.addClause}
        </Button>
      )}
    </div>
  );
}
