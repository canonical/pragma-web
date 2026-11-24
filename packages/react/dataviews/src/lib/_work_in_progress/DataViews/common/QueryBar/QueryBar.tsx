import type {
  PredicateOperand,
  SourceRefusal,
} from "@canonical/dataviews-core";
import { listOfferedOperators } from "@canonical/dataviews-core/bindings";
import type {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";
import { useEffect, useRef, useState } from "react";
import { useStableCallback } from "../../../../hooks/index.js";
import { QueryChips } from "../../../QueryChips/index.js";
import { ENTRY_ITEM_ID as ENTRY } from "../../../QueryInput/common/constants.js";
import { QueryInput } from "../../../QueryInput/index.js";
import { useDataViewsRoot } from "../../hooks/index.js";
import canTakeEntry from "./canTakeEntry.js";
import { DraftChip } from "./common/DraftChip/index.js";
import { QueryBarChip } from "./common/QueryBarChip/index.js";
import { DRAFT_ID } from "./constants.js";
import findMissingPart from "./findMissingPart.js";
import findNextPart from "./findNextPart.js";
import {
  useAnnounceOutcome,
  useClauseIds,
  useQueryBarSession,
  useQueryGroup,
  useSuggestedFacets,
} from "./hooks/index.js";
import listChipClauses from "./listChipClauses.js";
import readDraftId from "./readDraftId.js";
import readTypedOperator from "./readTypedOperator.js";
import resolveTypedSymbol from "./resolveTypedSymbol.js";
import speakClause from "./speakClause.js";
import spellOperand from "./spellOperand.js";
import suggestOptions from "./suggestOptions.js";
import type {
  DataViewsQueryBarProps,
  QueryBarChoice,
  QueryBarDraft,
  QueryBarOption,
  QueryBarPart,
  QueryPredicateClause,
  QuerySearchClause,
  TypedSymbolReading,
} from "./types.js";
import { findTabbableBeyond, readLabelsStandIn } from "./utils/index.js";
import writeChoice from "./writeChoice.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar";

/** A clause on one field: what an Entry builds or edits. */
type PredicateDraft = Extract<QueryBarDraft, { readonly kind: "predicate" }>;

/**
 * How a commit came about, which decides where focus goes after it: Enter
 * keeps it in the chip, Tab and Shift+Tab move it out of the bar in their
 * direction, and blur leaves it where it went.
 */
type CommitWay = "enter" | "forward" | "backward" | "blur";

/** A chip's clause as it applies, as the draft an edit starts from. */
const readAppliedDraft = (
  clause: QueryPredicateClause | QuerySearchClause,
): QueryBarDraft =>
  clause.kind === "search"
    ? {
        kind: "search",
        origin: { id: clause.id, ref: null },
        text: clause.search,
      }
    : {
        kind: "predicate",
        origin: {
          id: clause.id,
          ref: clause.refs[0],
          held: clause.predicate,
        },
        field: clause.predicate.field,
        operator: clause.predicate.operator,
        operands: clause.predicate.operands,
      };

/** Whether an option can be chosen. */
const isSelectable = (option: QueryBarOption): boolean =>
  option.disabled !== true && option.current !== true;

/** Whether a clause holds all it needs to apply. */
const isComplete = (draft: QueryBarDraft): boolean =>
  findMissingPart(draft) === null;

/** Two operand lists holding the same values, in any order. */
const isSameSet = (
  a: readonly PredicateOperand[],
  b: readonly PredicateOperand[],
): boolean =>
  a.length === b.length && a.every((operand) => b.includes(operand));

/**
 * A query bar narrows a collection with typed clauses and free text in one
 * field. Each clause is a query chip: a field, an operator and a value. It
 * places them in a **QueryInput**, whose suggestions it fills with fields,
 * operators and values as the person types. It commits each clause to the
 * store's query state, and it reads the chips, the counts and the
 * `current` marks from that state. Unlike **SearchInput**, which takes one
 * piece of text, a query bar builds structured clauses. Unlike Landscape's
 * **Search Query Editor**, it needs no grammar: every clause is built from
 * suggestions.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:global_dataviews.component.query_bar
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function QueryBar({
  label,
  quickFilters,
  className,
  onKeyDown,
  onBlur,
  onPointerDownCapture,
  ...rest
}: DataViewsQueryBarProps): ReactElement {
  const { provider, messages, announce } = useDataViewsRoot("QueryBar");
  const { schema } = provider.collection;
  const { capabilities } = provider;
  for (const field of quickFilters ?? []) {
    if (schema.findField(field) === undefined) {
      throw new Error(
        `DataViews.QueryBar: the schema has no field "${field}" to show as a quick filter`,
      );
    }
  }
  const labels = readLabelsStandIn();
  const group = useQueryGroup({ provider });
  const rootRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const { session, dispatch } = useQueryBarSession({ provider, rootRef });
  const clauses = useClauseIds({ group });
  const announceOutcome = useAnnounceOutcome({ provider, announce });
  // The latest session, for what a task or a blur reads later.
  const sessionRef = useRef(session);
  sessionRef.current = session;
  // The option QueryInput highlights, which Tab, Space and blur commit.
  const [highlighted, setHighlighted] = useState<string>();
  // A pointer press that started in the bar, during which focus can go
  // nowhere for a moment, as when Safari leaves a pressed button unfocused.
  const pressRef = useRef<{ check?: () => void } | undefined>(undefined);
  // Whether focus left the bar while an Entry was open: the stop's move
  // that closes it then takes no focus back.
  const hasLeftRef = useRef(false);
  // The direction Tab or Shift+Tab committed an edit in, which focus
  // leaves the bar in once the Entry is gone.
  const exitRef = useRef<"forward" | "backward" | null>(null);
  // After the items' own effects, which can focus the item the stop moved
  // to: focus taken back from the page goes back to it, and an edit Tab
  // committed sends focus on past the bar.
  // @note Impure: moves focus.
  useEffect(() => {
    const root = rootRef.current;
    const exit = exitRef.current;
    exitRef.current = null;
    if (exit !== null && root !== null) {
      // A task later, once the stop's arrival on the chip is done. With
      // nothing that way, focus leaves for the page.
      setTimeout(() => {
        const beyond = findTabbableBeyond(root, exit);
        if (beyond !== null) beyond.focus();
        else (document.activeElement as HTMLElement | null)?.blur();
      });
    }
    if (!hasLeftRef.current) return;
    hasLeftRef.current = false;
    const active = document.activeElement;
    if (active instanceof HTMLElement && root?.contains(active)) active.blur();
  });

  const { draft, part, typed, text } = session;
  const isEditing =
    draft !== null &&
    part !== null &&
    session.activeItem === `${readDraftId(draft)}:entry`;
  const editedDefinition =
    draft?.kind === "predicate" ? schema.findField(draft.field) : undefined;
  // The field whose options the Entry lists, while it takes a choice's value.
  const listedField =
    isEditing && part === "value" && editedDefinition?.kind === "choices"
      ? editedDefinition.field
      : null;
  const isListedValue = listedField !== null;
  const facets = useSuggestedFacets({ provider, field: listedField });
  const options = suggestOptions({
    part: isEditing ? part : "field",
    draft: isEditing ? draft : null,
    typed: isEditing ? typed : text,
    schema,
    capabilities,
    messages,
    labels,
    facets,
  });
  // Only a chip's listed part says it has nothing to offer: a search typed
  // in the entry, or a typed value, says nothing of none. The server's
  // options load with the first result.
  const takesSuggestions = isEditing && (part !== "value" || isListedValue);
  const isLoading =
    isListedValue &&
    editedDefinition?.kind === "choices" &&
    editedDefinition.options === undefined &&
    facets.latest === null;
  const loadingProps:
    | { readonly loading: true; readonly loadingLabel: string }
    | { readonly loading?: undefined } = isLoading
    ? { loading: true, loadingLabel: messages.loadingSuggestions }
    : {};
  const { decimalSeparator } = messages;

  /** The Entry's opening text for a part: a typed value's current value. */
  const readOpeningText = (next: PredicateDraft, at: QueryBarPart): string => {
    const definition = schema.findField(next.field);
    const operand = next.operands.at(0);
    return at === "value" &&
      definition?.kind !== "choices" &&
      operand !== undefined
      ? spellOperand(definition, operand, decimalSeparator)
      : "";
  };

  /**
   * The clause as an edit's value part opens on it: a choice's held values
   * are left out, so picks replace them, and come back where none is picked.
   */
  const readValueEdit = (next: PredicateDraft): PredicateDraft =>
    next.origin !== null &&
    schema.findField(next.field)?.kind === "choices" &&
    isSameSet(next.operands, next.origin.held.operands)
      ? { ...next, operands: [] }
      : next;

  /**
   * An edit's held values, put back where its value part was opened and
   * nothing picked in place of them, while its field is the same.
   */
  const restoreHeld = (next: PredicateDraft): PredicateDraft => {
    const { origin } = next;
    if (
      origin === null ||
      next.operator === "isSet" ||
      next.operands.length > 0 ||
      origin.ref.field !== next.field
    ) {
      return next;
    }
    return { ...next, operands: origin.held.operands };
  };

  /** Open the Entry on a part of a clause. */
  const openPart = (next: PredicateDraft, at: QueryBarPart): void => {
    dispatch({
      type: "edit",
      draft: next,
      part: at,
      typed: readOpeningText(next, at),
    });
  };

  /**
   * End the open edit unwritten: a draft is dropped, an edit restored. Its
   * part takes focus back, unless focus left the bar.
   */
  const cancel = (way: CommitWay = "enter"): void => {
    const current = sessionRef.current;
    /* v8 ignore next -- unreachable: only an open Entry or draft is cancelled */
    if (current.draft === null) return;
    const { origin } = current.draft;
    dispatch(
      origin === null
        ? { type: "close", item: ENTRY, focus: null }
        : {
            type: "close",
            item: origin.id,
            focus: way === "enter" ? current.part : null,
          },
    );
  };

  /**
   * The clause with what is typed in its Entry read into it: a typed
   * value parsed, or an option typed exactly. A reason instead where a
   * typed value does not read.
   */
  const readTypedInto = (
    current: PredicateDraft,
    at: QueryBarPart | null,
    entered: string,
  ): PredicateDraft | { readonly reason: string } => {
    const definition = schema.findField(current.field);
    if (at !== "value" || definition?.kind === "choices") {
      const wanted = entered.trim().toLocaleLowerCase();
      const exact = options.find(
        (option) =>
          isSelectable(option) && option.label.toLocaleLowerCase() === wanted,
      );
      return exact === undefined
        ? current
        : writeChoice(current, exact.choice, schema, capabilities);
    }
    // Text that still spells the held value keeps it as it is.
    if (entered.trim() === "" || entered === readOpeningText(current, at)) {
      return current;
    }
    const read = schema.validateInput(current.field, entered, decimalSeparator);
    if (read.status === "valid") return { ...current, operands: read.operands };
    return {
      reason:
        read.status === "invalid"
          ? read.reason
          : messages.filterIncomplete(false),
    };
  };

  /** Write a clause to the query group: the one place the bar commits. */
  const write = (next: PredicateDraft): readonly SourceRefusal[] => {
    const { operator } = next;
    /* v8 ignore next -- unreachable: a clause is complete before it is written */
    if (operator === null) return [];
    const predicate = { field: next.field, operator, operands: next.operands };
    const { origin } = next;
    if (origin === null) return group.addPredicate(predicate);
    return origin.ref.field === next.field && origin.ref.operator === operator
      ? group.setPredicate(predicate, origin.ref.nth)
      : group.editPredicates({ remove: [origin.ref], add: [predicate] });
  };

  /** The chip's clause that holds the same conjunct as a clause, if any. */
  const findHeldClause = (next: PredicateDraft) =>
    listChipClauses(group.state.get()).find(
      (clause) =>
        clause.kind === "predicate" &&
        clause.predicate.field === next.field &&
        clause.predicate.operator === next.operator &&
        isSameSet(clause.predicate.operands, next.operands),
    );

  /** The id the clause stands under once it applies. */
  const findAppliedId = (next: PredicateDraft): string => {
    const found = findHeldClause(next);
    /* v8 ignore next -- unreachable: a clause that applied is in the query */
    return found?.id ?? ENTRY;
  };

  /**
   * Commit a clause: written to the query group and its outcome said, the
   * Entry closed, and the stop resting on the free-text entry after a new
   * clause or on the clause after an edit, whose Segment takes focus
   * unless focus left the bar. An incomplete clause is cancelled; one the
   * source refuses keeps its Entry, and says why.
   */
  const commit = (picked: PredicateDraft, way: CommitWay): void => {
    const next = restoreHeld(picked);
    const { origin } = next;
    if (!isComplete(next)) {
      // An edit Tab leaves still leaves the bar that way.
      if (origin !== null && (way === "forward" || way === "backward")) {
        exitRef.current = way;
      }
      cancel(way);
      return;
    }
    // An edit that changes nothing writes nothing and says nothing.
    if (
      origin !== null &&
      origin.held.field === next.field &&
      origin.held.operator === next.operator &&
      isSameSet(origin.held.operands, next.operands)
    ) {
      if (way === "forward" || way === "backward") exitRef.current = way;
      dispatch({
        type: "close",
        item: origin.id,
        focus: way === "enter" ? sessionRef.current.part : null,
      });
      return;
    }
    // A clause the query already holds adds nothing, and says nothing.
    if (origin === null && findHeldClause(next) !== undefined) {
      dispatch({ type: "close", item: ENTRY, focus: null });
      return;
    }
    const refusals = write(next);
    if (refusals.length > 0) {
      if (way === "blur") {
        announceRefusals(refusals);
        cancel(way);
      } else {
        markInvalid(refusals.map(({ reason }) => reason).join("; "));
      }
      return;
    }
    const isNew = next.origin === null;
    const spoken = speakClause(next, schema, labels, messages);
    const { recordNoun } = labels;
    announceOutcome((count) =>
      isNew
        ? messages.clauseAdded(spoken, count, recordNoun)
        : messages.clauseChanged(spoken, count, recordNoun),
    );
    if (isNew) {
      dispatch({ type: "close", item: ENTRY, focus: null });
      return;
    }
    if (way === "forward" || way === "backward") exitRef.current = way;
    dispatch({
      type: "close",
      item: findAppliedId(next),
      focus: way === "enter" ? sessionRef.current.part : null,
    });
  };

  /**
   * Mark what the Entry holds invalid, and say why: the Entry's own
   * description is not read again while it keeps focus.
   */
  const markInvalid = (reason: string): void => {
    dispatch({ type: "invalid", reason });
    announce(messages.clauseInvalid(reason));
  };

  /** Say why the source refused a command, and that what applied stands. */
  const announceRefusals = (refusals: readonly SourceRefusal[]): void => {
    announce(
      messages.filterRefused(
        refusals.map(({ reason }) => reason),
        true,
      ),
    );
  };

  /** Say that a typed `>` or `<` reads as the bound it stops short of. */
  const announceWidened = (reading: TypedSymbolReading): void => {
    if (!reading.widened) return;
    announce(
      reading.operator === "gte"
        ? messages.readAsAtLeast
        : messages.readAsAtMost,
    );
  };

  /**
   * The operator a part's typed text settles exactly: a symbol, which may
   * stop short of its bound and is then said to, or an option's words.
   */
  const settleTypedOperator = (
    current: PredicateDraft,
    entered: string,
  ): PredicateDraft | null => {
    const definition = schema.findField(current.field);
    /* v8 ignore next -- unreachable: a clause is built on a field of the schema */
    if (definition === undefined) return null;
    const reading = resolveTypedSymbol(
      entered.trim(),
      listOfferedOperators(definition, capabilities),
    );
    if (reading === null) return null;
    announceWidened(reading);
    return writeChoice(
      current,
      { kind: "operator", operator: reading.operator, operands: null },
      schema,
      capabilities,
    );
  };

  /**
   * Move an Entry on from an operator settled by a typed symbol: to the
   * value, with what was typed after the symbol, or empty, so the next keys
   * type a new value while nothing typed keeps the held one. Nothing
   * commits until Enter, Tab or blur.
   */
  const moveToValue = (next: PredicateDraft, rest: string): void => {
    dispatch({
      type: "edit",
      draft: readValueEdit(next),
      part: "value",
      typed: rest,
    });
  };

  /** Write a chosen suggestion into the Entry's clause, and move on. */
  const choose = (choice: QueryBarChoice): void => {
    const current = sessionRef.current;
    if (current.draft === null || current.part === null) {
      // In the free-text entry, a field starts a clause.
      /* v8 ignore next -- unreachable: the free-text entry offers fields alone */
      if (choice.kind !== "field") return;
      openPart(
        {
          kind: "predicate",
          origin: null,
          field: choice.field,
          operator: null,
          operands: [],
        },
        "operator",
      );
      return;
    }
    /* v8 ignore next -- unreachable: the search's Entry offers nothing */
    if (current.draft.kind !== "predicate") return;
    const next = writeChoice(current.draft, choice, schema, capabilities);
    if (choice.kind === "value") {
      // Several values take two Enters: the Entry stays to add another,
      // and the clause as it now reads is said.
      openPart(next, "value");
      announce(
        messages.valuePicked(speakClause(next, schema, labels, messages)),
      );
      return;
    }
    const missing = findMissingPart(next);
    if (missing === null) commit(next, "enter");
    else openPart(next, missing);
  };

  /** QueryInput chose an option, by Enter on it or a click. */
  const handleOptionSelect = (optionId: string): void => {
    const option = options.find(({ id }) => id === optionId);
    /* v8 ignore next -- unreachable: QueryInput chooses among these options */
    if (option !== undefined) choose(option.choice);
  };

  /** What is typed in a chip's Entry; a typed symbol settles an operator. */
  const handleTypedChange = useStableCallback((entered: string): void => {
    const current = sessionRef.current;
    if (current.part === "operator" && current.draft?.kind === "predicate") {
      const definition = schema.findField(current.draft.field);
      const reading = readTypedOperator(
        entered,
        /* v8 ignore next -- unreachable: a clause is built on a field of the schema */
        definition === undefined
          ? []
          : listOfferedOperators(definition, capabilities),
      );
      if (reading !== null) {
        const next = writeChoice(
          current.draft,
          { kind: "operator", operator: reading.operator, operands: null },
          schema,
          capabilities,
        );
        announceWidened(reading);
        moveToValue(next, reading.rest);
        return;
      }
    }
    dispatch({ type: "typePart", text: entered });
  });

  /** Enter in a chip's Entry, with nothing highlighted. */
  const enterPart = (): void => {
    const current = sessionRef.current;
    /* v8 ignore next -- unreachable: only an open Entry on a field's clause hears its keys */
    if (current.draft?.kind !== "predicate" || current.part === null) return;
    const at = current.part;
    const isTyped = current.typed.trim() !== "";
    if (at === "operator" && isTyped) {
      // A symbol typed whole settles its operator, even one a longer
      // symbol could continue.
      const settled = settleTypedOperator(current.draft, current.typed);
      if (settled !== null) {
        moveToValue(settled, "");
        return;
      }
    }
    const isListedPart = at === "field" || at === "operator" || isListedValue;
    // A draft's operator takes the first offered with nothing typed; an
    // edit keeps the one it holds.
    const isTakingFirst =
      isListedPart &&
      (isTyped || (at === "operator" && current.draft.origin === null));
    // What is typed takes the first option it narrows to, the held one
    // among them, which keeps the clause as it is.
    const first = isTakingFirst
      ? options.find((option) => option.disabled !== true)
      : undefined;
    if (first?.current === true) {
      const target = findNextPart(current.draft, at, false);
      if (target === null) commit(current.draft, "enter");
      else {
        openPart(
          target === "value" ? readValueEdit(current.draft) : current.draft,
          target,
        );
      }
      return;
    }
    if (first !== undefined) {
      choose(first.choice);
      return;
    }
    // What is typed matches nothing to choose: the Entry waits.
    if (isListedPart && isTyped) return;
    const next = readTypedInto(current.draft, at, current.typed);
    if ("reason" in next) {
      markInvalid(next.reason);
      return;
    }
    // A clause still missing a part waits for it.
    if (isComplete(restoreHeld(next))) commit(next, "enter");
  };

  /**
   * Tab or Shift+Tab in a chip's Entry: what is highlighted or typed is
   * written and the Entry moves to the next part; past either end the
   * clause commits. A draft's field, its only Segment, goes back to the
   * free-text entry as text before it.
   */
  const moveAcross = (backward: boolean): void => {
    const current = sessionRef.current;
    /* v8 ignore next -- unreachable: only an open Entry on a field's clause hears its keys */
    if (current.draft?.kind !== "predicate" || current.part === null) return;
    const at = current.part;
    const isTyped = current.typed.trim() !== "";
    const option = options.find(({ id }) => id === highlighted);
    const settled =
      option === undefined && at === "operator" && isTyped
        ? settleTypedOperator(current.draft, current.typed)
        : null;
    const isListedPart = at === "field" || at === "operator" || isListedValue;
    // Typed text narrows as on Enter: the first option it leaves, the held
    // one among them, which keeps the clause.
    const narrowed =
      option === undefined && settled === null && isListedPart && isTyped
        ? options.find((candidate) => candidate.disabled !== true)
        : undefined;
    if (
      option === undefined &&
      settled === null &&
      isListedPart &&
      isTyped &&
      narrowed === undefined
    ) {
      markInvalid(messages.noSuggestions);
      return;
    }
    const picked =
      option ?? (narrowed?.current === true ? undefined : narrowed);
    const read =
      picked !== undefined
        ? writeChoice(current.draft, picked.choice, schema, capabilities)
        : (settled ??
          (narrowed !== undefined
            ? current.draft
            : readTypedInto(current.draft, at, current.typed)));
    const target0 = findNextPart(current.draft, at, backward);
    // Text that does not read is not thrown away past either end.
    if ("reason" in read && target0 === null) {
      markInvalid(read.reason);
      return;
    }
    let written = "reason" in read ? current.draft : read;
    if (at === "operator" && written.operator === null && !backward) {
      // A draft's operator takes the first offered, as Enter does.
      const first = options.find(isSelectable);
      /* v8 ignore next -- unreachable: a field is offered only with an operator */
      if (first === undefined) return;
      written = writeChoice(written, first.choice, schema, capabilities);
    }
    const target = findNextPart(written, at, backward);
    if (target === null) {
      commit(written, backward ? "backward" : "forward");
      return;
    }
    if (!canTakeEntry(written, target)) {
      dispatch({ type: "close", item: ENTRY, focus: null });
      dispatch({
        type: "typeText",
        text: labels.readFieldLabel(written.field),
      });
      return;
    }
    openPart(target === "value" ? readValueEdit(written) : written, target);
  };

  /** A chip's Entry: Escape cancels, Enter and Tab commit, Space picks. */
  const handleEntryKeyDown = useStableCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      // An input method's keys confirm its candidate, not the clause.
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      } else if (event.key === "Enter") {
        event.preventDefault();
        enterPart();
      } else if (event.key === "Tab") {
        // Removing the focused Entry mid-Tab would drop focus to the page.
        event.preventDefault();
        moveAcross(event.shiftKey);
      } else if (event.key === " " && isListedValue) {
        // Space commits a value picked from the suggestions; typed, it is text.
        const option = options.find(({ id }) => id === highlighted);
        const current = sessionRef.current;
        if (option === undefined || current.draft?.kind !== "predicate") return;
        event.preventDefault();
        commit(
          writeChoice(current.draft, option.choice, schema, capabilities),
          "enter",
        );
      }
    },
  );

  /**
   * Enter in the free-text entry, with nothing highlighted: a field's name
   * typed whole starts a clause; anything else is the search.
   */
  const handleEntryEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      event.key !== "Enter" ||
      event.defaultPrevented ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    const typedText = text.trim();
    if (typedText === "") return;
    event.preventDefault();
    const field = options.find(
      (option) =>
        isSelectable(option) &&
        option.label.toLocaleLowerCase() === typedText.toLocaleLowerCase(),
    );
    if (field !== undefined) {
      choose(field.choice);
      return;
    }
    const applied = group.state.get().slice.search ?? "";
    if (typedText === applied) {
      // The search already applies: nothing to write or say.
      dispatch({ type: "typeText", text: "" });
      return;
    }
    const isAdded = applied === "";
    const refusals = group.setSearch(typedText);
    if (refusals.length > 0) {
      announceRefusals(refusals);
      return;
    }
    const spoken = messages.searchClause(typedText);
    announceOutcome((count) =>
      isAdded
        ? messages.clauseAdded(spoken, count, labels.recordNoun)
        : messages.clauseChanged(spoken, count, labels.recordNoun),
    );
    dispatch({ type: "typeText", text: "" });
  };

  /**
   * A press on another chip than the one whose Entry is open ends the open
   * clause as a stop move does: a complete clause applies, another is
   * cancelled. Then the pressed clause is read again, since ids can shift
   * after a commit.
   */
  const endOtherClause = (pressed: QueryBarDraft): QueryBarDraft => {
    const { draft: open } = sessionRef.current;
    if (open === null || readDraftId(open) === readDraftId(pressed)) {
      return pressed;
    }
    leave(highlighted, true);
    const standing = listChipClauses(group.state.get()).find((clause) =>
      pressed.kind === "search"
        ? clause.kind === "search"
        : clause.kind === "predicate" &&
          pressed.origin !== null &&
          clause.predicate.field === pressed.origin.held.field &&
          clause.predicate.operator === pressed.origin.held.operator &&
          isSameSet(clause.predicate.operands, pressed.origin.held.operands),
    );
    /* v8 ignore next -- unreachable: ending one clause leaves every other standing */
    return standing === undefined ? pressed : readAppliedDraft(standing);
  };

  /**
   * Remove a clause, and move the stop to the next chip, else the previous,
   * else the entry, by position, since ids renumber after a removal.
   */
  const remove = useStableCallback((pressed: QueryBarDraft): void => {
    const applied = endOtherClause(pressed);
    // Read the place after the open clause ends: it may stand ahead.
    const index = listChipClauses(group.state.get()).findIndex(
      ({ id }) => id === applied.origin?.id,
    );
    const { origin } = applied;
    /* v8 ignore next -- unreachable: an applied clause has its place, and a draft is cancelled instead */
    if (origin === null) return;
    const refusals =
      origin.ref === null
        ? group.setSearch("")
        : group.removePredicate(origin.ref);
    if (refusals.length > 0) {
      announceRefusals(refusals);
      return;
    }
    const rest = listChipClauses(group.state.get());
    const next = rest.at(index) ?? rest.at(index - 1);
    const spoken = speakClause(applied, schema, labels, messages);
    announceOutcome((count) =>
      messages.clauseRemoved(spoken, count, labels.recordNoun),
    );
    dispatch({ type: "close", item: next?.id ?? ENTRY, focus: null });
  });

  /**
   * A Segment activated: its part takes the Entry, if the chip keeps one.
   * The search is edited where it is typed: its text returns to the entry.
   */
  const activate = useStableCallback(
    (pressed: QueryBarDraft, at: QueryBarPart): void => {
      const applied = endOtherClause(pressed);
      if (applied.kind === "search") {
        dispatch({ type: "close", item: ENTRY, focus: null });
        dispatch({ type: "typeText", text: applied.text });
        entryRef.current?.focus();
        return;
      }
      const current = sessionRef.current;
      const isSameChip =
        current.draft !== null &&
        readDraftId(current.draft) === readDraftId(applied);
      // What is typed in the open part is read in first, as Tab does.
      let base: PredicateDraft = applied;
      if (isSameChip && current.draft?.kind === "predicate") {
        const read = readTypedInto(current.draft, current.part, current.typed);
        base = "reason" in read ? current.draft : read;
      }
      if (!canTakeEntry(base, at)) return;
      openPart(at === "value" && !isSameChip ? readValueEdit(base) : base, at);
    },
  );

  /** The bar's keys: arrows between items, Backspace and Delete on chips. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
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
        : target.closest<HTMLElement>(".ds.query-chip");
    const chipId = chip?.id;
    const last = clauses.at(-1);
    if (item === ENTRY && event.key === "Backspace" && text === "" && last) {
      // Backspace in the empty entry selects the last chip.
      event.preventDefault();
      dispatch({ type: "moveStop", item: last.id });
      return;
    }
    if (
      chipId !== undefined &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      event.preventDefault();
      if (chipId === DRAFT_ID) {
        cancel();
        return;
      }
      const reading = listChipClauses(group.state.get()).find(
        ({ id }) => id === chipId,
      );
      /* v8 ignore next -- unreachable: every chip but the draft is a clause */
      if (reading !== undefined) remove(readAppliedDraft(reading));
      return;
    }
    if (chipId !== undefined && event.key === "Escape") {
      // Escape on a chip returns to the entry.
      event.preventDefault();
      dispatch({ type: "moveStop", item: ENTRY });
      return;
    }
    const isPrintable =
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey;
    if (chipId !== undefined && isPrintable) {
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
    if (draft !== null && item === `${readDraftId(draft)}:entry`) return;
    if (target instanceof HTMLInputElement) {
      const atStart = target.selectionStart === 0;
      const atEnd = target.selectionEnd === target.value.length;
      if (event.key === "ArrowLeft" ? !atStart : !atEnd) return;
    }
    const items = [
      ...new Set(
        [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "[data-roving-item]",
          ),
        ].map((element) => String(element.dataset["rovingItem"])),
      ),
    ];
    const index =
      items.indexOf(session.activeItem) + (event.key === "ArrowRight" ? 1 : -1);
    const next = index >= 0 ? items.at(index) : undefined;
    if (next === undefined) return;
    event.preventDefault();
    dispatch({ type: "moveStop", item: next });
  };

  /**
   * The stop moved to another item in the bar. Leaving the Entry's chip
   * ends its edit as blur does: a complete clause applies, another is
   * cancelled.
   */
  const moveStop = (item: string): void => {
    const { draft: open } = sessionRef.current;
    const id = open === null ? null : readDraftId(open);
    if (id === null || item === id || item === `${id}:entry`) {
      dispatch({ type: "moveStop", item });
      return;
    }
    const press = pressRef.current;
    if (press === undefined) {
      leave(highlighted, true);
      dispatch({ type: "moveStop", item });
      return;
    }
    // During a press, ending the clause now would shift the pressed part
    // from under the pointer: the part's own press ends it, or the press's
    // end does, if the same clause is still open.
    const prior = press.check;
    press.check = () => {
      prior?.();
      const still = sessionRef.current.draft;
      if (still === null || readDraftId(still) !== id) return;
      leave(highlighted, true);
      dispatch({ type: "moveStop", item });
    };
  };

  /**
   * Focus left the bar: the edit commits, a complete clause applying and an
   * incomplete one cancelled, and focus stays where it went.
   */
  const leave = (optionId: string | undefined, isInBar = false): void => {
    const current = sessionRef.current;
    if (current.draft?.kind !== "predicate") return;
    // A leave already heard holds until its effects have run.
    hasLeftRef.current ||= !isInBar;
    const option = options.find(({ id }) => id === optionId);
    const read =
      option !== undefined
        ? writeChoice(current.draft, option.choice, schema, capabilities)
        : readTypedInto(current.draft, current.part, current.typed);
    if ("reason" in read) cancel("blur");
    else commit(read, "blur");
  };

  /**
   * Focus leaving the bar commits an edit. Focus that goes nowhere, as when
   * a focused Entry moves in the DOM, is checked again after a task, once
   * it has been given back.
   */
  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    onBlur?.(event);
    const root = event.currentTarget;
    const next = event.relatedTarget as Node | null;
    // What the Entry that lost focus commits, read while it is there.
    const optionId =
      event.target instanceof HTMLInputElement &&
      event.target.closest(".ds.query-chip")
        ? highlighted
        : undefined;
    if (next) {
      if (!root.contains(next)) leave(optionId);
      return;
    }
    const check = (): void => {
      if (!root.contains(document.activeElement)) leave(optionId);
    };
    // During a press in the bar, the check waits for the press to end.
    if (pressRef.current) pressRef.current.check = check;
    else setTimeout(check);
  };

  /**
   * A press in the bar holds the blur check until it ends, a task later.
   * Heard as it goes down, before the pressed item takes the stop.
   */
  // @note Impure: listens to the document for the press's end.
  const handlePointerDownCapture = (
    event: PointerEvent<HTMLDivElement>,
  ): void => {
    onPointerDownCapture?.(event);
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

  // The clear control shows only while there is something to clear.
  const clearProps =
    clauses.length > 0 || text !== ""
      ? {
          onClear: () => {
            const refusals = group.clear(["filter", "search"]);
            // Refused, the text and the session stay as they are.
            if (refusals.length > 0) {
              announceRefusals(refusals);
              return;
            }
            announceOutcome((count) =>
              messages.queryCleared(count, labels.recordNoun),
            );
            dispatch({ type: "close", item: ENTRY, focus: null });
            dispatch({ type: "typeText", text: "" });
            entryRef.current?.focus();
          },
          clearLabel: messages.clearFiltersAndSearch,
        }
      : {};

  const edit =
    draft !== null && draft.origin !== null && part !== null
      ? { draft, part, typed, invalid: session.invalid }
      : null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the bar hears the keys that bubble from the toolbar's items
    <div
      {...rest}
      ref={rootRef}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerDownCapture={handlePointerDownCapture}
    >
      <QueryInput
        ref={entryRef}
        label={label ?? messages.queryBar(labels.recordNoun)}
        description={messages.queryBarDescription}
        placeholder={messages.queryBarPlaceholder}
        value={text}
        onValueChange={(entered) =>
          dispatch({ type: "typeText", text: entered })
        }
        onKeyDown={handleEntryEnter}
        options={[...options]}
        onOptionSelect={handleOptionSelect}
        onHighlightChange={setHighlighted}
        emptyText={
          takesSuggestions && !isLoading ? messages.noSuggestions : undefined
        }
        {...loadingProps}
        footer={isListedValue ? messages.multipleValuesHint : undefined}
        activeItem={session.activeItem}
        onActiveItemChange={moveStop}
        hiddenLabel={messages.hiddenChips}
        {...clearProps}
      >
        {(clauses.length > 0 || draft?.origin === null) && (
          <QueryChips label={messages.appliedFilters}>
            {clauses.map((clause) => (
              <QueryBarChip
                key={clause.id}
                clause={clause}
                group={group}
                edit={edit?.draft.origin?.id === clause.id ? edit : null}
                onActivate={activate}
                onRemove={remove}
                onTypedChange={handleTypedChange}
                onEntryKeyDown={handleEntryKeyDown}
              />
            ))}
            {draft !== null && draft.origin === null && (
              <DraftChip
                id={DRAFT_ID}
                draft={draft}
                part={part}
                typed={typed}
                invalid={session.invalid}
                onActivate={(at) => activate(draft, at)}
                onRemove={cancel}
                onTypedChange={handleTypedChange}
                onEntryKeyDown={handleEntryKeyDown}
              />
            )}
          </QueryChips>
        )}
      </QueryInput>
    </div>
  );
}
