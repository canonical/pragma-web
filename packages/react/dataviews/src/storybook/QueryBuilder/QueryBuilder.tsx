import type { FocusEvent, KeyboardEvent, ReactElement } from "react";
import { useEffect, useReducer, useRef, useState } from "react";
import { QueryChip } from "../../lib/_work_in_progress/QueryChip/index.js";
import { QueryChips } from "../../lib/_work_in_progress/QueryChips/index.js";
import { ENTRY_ITEM_ID as ENTRY } from "../../lib/_work_in_progress/QueryInput/common/constants.js";
import type { QueryInputOption } from "../../lib/_work_in_progress/QueryInput/index.js";
import { QueryInput } from "../../lib/_work_in_progress/QueryInput/index.js";
import { FIELDS, OPERATORS, PARTS } from "./constants.js";
import reduceQuery from "./reduceQuery.js";
import type { Clause, Part, QueryBuilderProps } from "./types.js";

/** Text as it is compared: trimmed, and in one case. */
const normalise = (text: string): string => text.trim().toLocaleLowerCase();

/** The suggestions for one part of a clause, filtered by what is typed. */
const findOptions = (
  part: Part,
  clause: Clause | undefined,
  typed: string,
): QueryInputOption[] => {
  const matches = (label: string) =>
    label.toLocaleLowerCase().includes(normalise(typed));
  const isCurrent = (id: string) => clause?.[part] === id;
  if (part === "field") {
    return Object.keys(FIELDS)
      .filter(matches)
      .map((field) => ({
        id: field,
        label: field,
        hint: `${FIELDS[field]?.length ?? 0} values`,
        current: isCurrent(field),
      }));
  }
  if (part === "operator") {
    return OPERATORS.filter(({ label }) => matches(label)).map(
      ({ id, label }) => ({ id, label, current: isCurrent(id) }),
    );
  }
  return (FIELDS[clause?.field ?? ""] ?? []).filter(matches).map((value) => ({
    id: value,
    label: value,
    current: isCurrent(value),
  }));
};

/** The option whose label is exactly what was typed, if one can be chosen. */
const findExactOption = (
  options: QueryInputOption[],
  typed: string,
): QueryInputOption | undefined =>
  options.find(
    ({ label, disabled, current }) =>
      label.toLocaleLowerCase() === normalise(typed) && !disabled && !current,
  );

/** The clause's words, spoken as the chip's name. */
const readClause = ({ field, operator, value }: Clause): string =>
  [field, operator, value].filter(Boolean).join(" ");

/** A part's spoken role in an Entry's name. */
const PART_NAMES: Record<Part, string> = {
  field: "Field",
  operator: "Operator",
  value: "Value",
};

/**
 * A host that builds chips in a QueryInput, as a query bar does. Its rules
 * are `reduceQuery`'s; this component only wires them to QueryInput.
 */
export default function QueryBuilder({
  initial = [],
  inlineSize,
  disabled = false,
}: QueryBuilderProps): ReactElement {
  const [state, dispatch] = useReducer(reduceQuery, {
    clauses: initial,
    text: "",
    edit: undefined,
    activeItem: ENTRY,
    focusPart: undefined,
    nextId: initial.length + 1,
  });
  const { clauses, text, edit, activeItem, focusPart } = state;
  // The latest state, for checks a task later.
  const stateRef = useRef(state);
  stateRef.current = state;
  const rootRef = useRef<HTMLDivElement>(null);
  // The option QueryInput highlights, which Tab and blur commit.
  const [highlighted, setHighlighted] = useState<string>();
  // A pointer press that started in the field, during which focus can go
  // nowhere for a moment, as when Safari leaves a pressed button unfocused.
  const pressRef = useRef<{ check?: () => void } | undefined>(undefined);
  const entryRef = useRef<HTMLInputElement>(null);

  // The suggestions belong to whichever entry holds the stop.
  const editedClause = clauses.find(({ id }) => id === edit?.id);
  const isEditing = edit !== undefined && activeItem === `${edit.id}:entry`;
  const options = isEditing
    ? findOptions(edit.part, editedClause, edit.text)
    : findOptions("field", undefined, text);

  // After an edit, focus returns to the part that took the Entry's place.
  // It waits a task, past the stop's own arrival on the chip's first part,
  // and leaves focus alone once it has moved out of the field.
  // @note Impure: moves focus.
  useEffect(() => {
    if (!focusPart) return;
    const timer = setTimeout(() => {
      const root = rootRef.current;
      const active = document.activeElement;
      const isLost = !active || active === document.body;
      if (!root || !(isLost || root.contains(active))) return;
      root
        .querySelector<HTMLElement>(
          `[id="${focusPart.id}"] [data-part="${focusPart.part}"]`,
        )
        ?.focus();
    });
    return () => clearTimeout(timer);
  }, [focusPart]);

  // When the open edit moves to another part, its Entry can move in the
  // DOM, which drops focus; it takes focus back unless focus moved away.
  // @note Impure: moves focus.
  const editId = edit?.id;
  const editPart = edit?.part;
  useEffect(() => {
    if (!editId || !editPart) return;
    const root = rootRef.current;
    const active = document.activeElement;
    const isLost = !active || active === document.body;
    if (!root || !(isLost || root.contains(active))) return;
    root
      .querySelector<HTMLElement>(`[data-roving-item="${editId}:entry"]`)
      ?.focus();
  }, [editId, editPart]);

  /** Enter with nothing highlighted chooses the option typed exactly. */
  const chooseExact = (
    event: KeyboardEvent<HTMLInputElement>,
    typed: string,
  ): void => {
    if (event.key !== "Enter" || event.defaultPrevented) return;
    const option = findExactOption(options, typed);
    if (!option) return;
    event.preventDefault();
    dispatch({ type: "choose", optionId: option.id });
  };

  /**
   * What a chip's Entry commits: the highlighted option, else the option
   * typed exactly.
   */
  const findCommitOption = (): string | undefined =>
    highlighted ?? findExactOption(options, edit?.text ?? "")?.id;

  /** A chip's Entry: Escape cancels, Tab moves between parts, Enter chooses. */
  const handlePartKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Escape") {
      dispatch({ type: "cancelEdit" });
    } else if (event.key === "Tab") {
      // Tab writes what is chosen and moves to the next part; past the first
      // or last, the chip is committed and focus returns to the entry or the
      // part, where the next Tab leaves the field. Removing the focused
      // Entry mid-Tab would drop focus to the page instead.
      event.preventDefault();
      dispatch({
        type: "movePart",
        backward: event.shiftKey,
        optionId: findCommitOption(),
      });
    } else {
      chooseExact(event, edit?.text ?? "");
    }
  };

  /** The host's keys: arrows between items, Backspace and Delete on chips. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    const item = target
      .closest("[data-roving-item]")
      ?.getAttribute("data-roving-item");
    // Any part of a chip, not only its roving item, removes it; typing in
    // its Entry does not.
    const chip =
      target instanceof HTMLInputElement
        ? null
        : target.closest(".ds.query-chip");
    const clause = clauses.find(({ id }) => id === chip?.id);
    const last = clauses.at(-1);
    if (item === ENTRY && event.key === "Backspace" && !text && last) {
      // Backspace in the empty entry moves to the last chip.
      event.preventDefault();
      dispatch({ type: "moveStop", item: last.id });
      return;
    }
    if (clause && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      dispatch({ type: "remove", id: clause.id });
      return;
    }
    if (clause && event.key === "Escape") {
      // Escape on a chip returns to the entry.
      event.preventDefault();
      dispatch({ type: "moveStop", item: ENTRY });
      return;
    }
    const isPrintable =
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey;
    if (clause && isPrintable) {
      // A character typed on a chip starts typing in the entry.
      event.preventDefault();
      dispatch({ type: "moveStop", item: ENTRY });
      dispatch({ type: "typeText", text: text + event.key });
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    // Only the toolbar's items rove; the clear control sits outside it.
    if (!target.closest('[role="toolbar"]')) return;
    // In an open Entry, the arrows only move the caret.
    if (edit && item === `${edit.id}:entry`) return;
    if (target instanceof HTMLInputElement) {
      const atStart = (target.selectionStart ?? 0) === 0;
      const atEnd = (target.selectionEnd ?? 0) === target.value.length;
      if (event.key === "ArrowLeft" ? !atStart : !atEnd) return;
    }
    const items = [
      ...new Set(
        [...event.currentTarget.querySelectorAll("[data-roving-item]")].map(
          (element) => element.getAttribute("data-roving-item") ?? "",
        ),
      ),
    ];
    const index =
      items.indexOf(activeItem) + (event.key === "ArrowRight" ? 1 : -1);
    const next = index >= 0 ? items.at(index) : undefined;
    if (next === undefined) return;
    event.preventDefault();
    dispatch({ type: "moveStop", item: next });
  };

  /**
   * Focus leaving the field commits an edit. Focus that goes nowhere, as
   * when a focused Entry moves in the DOM, is checked again after a task,
   * once it has been given back.
   */
  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    const root = event.currentTarget;
    const next = event.relatedTarget as Node | null;
    // What the Entry that lost focus commits, read while it is there.
    const optionId =
      event.target instanceof HTMLInputElement &&
      event.target.closest(".ds.query-chip")
        ? findCommitOption()
        : undefined;
    if (next) {
      if (!root.contains(next)) leave(optionId);
      return;
    }
    const check = (): void => {
      if (!root.contains(document.activeElement)) leave(optionId);
    };
    // During a press in the field, the check waits for the press to end.
    if (pressRef.current) pressRef.current.check = check;
    else setTimeout(check);
  };

  /**
   * Focus left the field: the edit is committed. QueryInput keeps the stop's
   * move from taking focus back, so focus stays where it went.
   */
  const leave = (optionId: string | undefined): void => {
    if (stateRef.current.edit) dispatch({ type: "leave", optionId });
  };

  /** A press in the field holds the blur check until it ends, a task later. */
  // @note Impure: listens to the document for the press's end.
  const handlePointerDown = (): void => {
    pressRef.current = {};
    const end = (): void => {
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      setTimeout(() => {
        const check = pressRef.current?.check;
        pressRef.current = undefined;
        check?.();
      });
    };
    // A press that ends as a scroll ends in pointercancel instead.
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  };

  const renderPart = (clause: Clause, part: Part): ReactElement | null => {
    if (edit?.id === clause.id && edit.part === part) {
      return (
        // Keyed by part, so each part's Entry is a new focus, which screen
        // readers announce.
        <QueryChip.Entry
          key={`entry-${part}`}
          value={edit.text}
          onValueChange={(typed) => dispatch({ type: "typePart", text: typed })}
          label={`${PART_NAMES[part]} for ${clause.field}`}
          onKeyDown={handlePartKeyDown}
        />
      );
    }
    const value = clause[part];
    if (!value) return null;
    const operator = OPERATORS.find(({ id }) => id === value);
    const condition = part === "operator" ? operator?.condition : undefined;
    return (
      <QueryChip.Segment
        key={part}
        data-part={part}
        onActivate={() => dispatch({ type: "editPart", id: clause.id, part })}
        {...(condition ? { condition } : {})}
      >
        {operator && part === "operator" ? operator.label : value}
      </QueryChip.Segment>
    );
  };

  // The clear control shows only while there is something to clear.
  const clearProps:
    | { onClear: () => void; clearLabel: string }
    | { onClear?: undefined; clearLabel?: undefined } =
    clauses.length > 0 || text
      ? {
          onClear: () => {
            dispatch({ type: "clear" });
            entryRef.current?.focus();
          },
          clearLabel: "Clear filters and search",
        }
      : { onClear: undefined, clearLabel: undefined };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the host hears the keys that bubble from the toolbar's items
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
      style={inlineSize ? { inlineSize } : undefined}
    >
      <QueryInput
        label="Filter machines"
        description="Type a field and choose it. Use the left and right arrows to move between filters, Enter to edit a filter, Tab to move between its parts, and Delete to remove it."
        ref={entryRef}
        placeholder="Search or filter"
        value={text}
        onValueChange={(typed) => dispatch({ type: "typeText", text: typed })}
        onKeyDown={(event) => chooseExact(event, text)}
        options={options}
        onOptionSelect={(optionId) => dispatch({ type: "choose", optionId })}
        onHighlightChange={setHighlighted}
        emptyText="No matches"
        activeItem={activeItem}
        onActiveItemChange={(item) => dispatch({ type: "moveStop", item })}
        hiddenLabel={(count) => `+${count} more`}
        disabled={disabled}
        {...clearProps}
      >
        {clauses.length > 0 && (
          <QueryChips label="Filters">
            {clauses.map((clause) => (
              <QueryChip
                key={clause.id}
                id={clause.id}
                label={readClause(clause)}
                disabled={disabled}
                onRemove={() => dispatch({ type: "remove", id: clause.id })}
                removeLabel={`Remove ${readClause(clause)}`}
              >
                {PARTS.map((part) => renderPart(clause, part))}
              </QueryChip>
            ))}
          </QueryChips>
        )}
      </QueryInput>
    </div>
  );
}
