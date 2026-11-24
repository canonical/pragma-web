import type {
  Predicate,
  PredicateOperand,
  QueryIssue,
  SourceRefusal,
} from "@canonical/dataviews-core";
import {
  isNarrowingIssue,
  listOfferedOperators,
  QUERY_KEYS,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import type {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ENTRY_ITEM_ID as ENTRY } from "../../../../../component/QueryInput/common/constants.js";
import { QueryInput } from "../../../../../component/QueryInput/index.js";
import { QueryChips } from "../../../../../group/QueryChips/index.js";
import {
  useDataViewsValue,
  useIsHydrated,
  useStableCallback,
} from "../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../hooks/index.js";
import { DraftChip } from "./common/DraftChip/index.js";
import { FiltersDisclosure } from "./common/FiltersDisclosure/index.js";
import {
  MessageLine,
  type MessageLineEntry,
} from "./common/MessageLine/index.js";
import { QueryBarChip } from "./common/QueryBarChip/index.js";
import {
  chooseArrangement,
  listFieldConjuncts,
  QuickFilter,
} from "./common/QuickFilter/index.js";
import { RangeChip } from "./common/RangeChip/index.js";
import { RefusedChip } from "./common/RefusedChip/index.js";
import { SearchForm } from "./common/SearchForm/index.js";
import { Sheet } from "./common/Sheet/index.js";
import { SummaryButton } from "./common/SummaryButton/index.js";
import { DRAFT_ID } from "./constants.js";
import {
  useAnnounceOutcome,
  useClauseIds,
  useFieldOverflow,
  useLinkFocusHandoff,
  useNarrowMode,
  useQueryBarSession,
  useQueryGroup,
  useQuickFilterPanels,
  useSheetAnnouncer,
  useSuggestedFacets,
} from "./hooks/index.js";
import type {
  DataViewsQueryBarPreset,
  DataViewsQueryBarProps,
  QueryBarChoice,
  QueryBarDraft,
  QueryBarOption,
  QueryBarPart,
  QueryClause,
  QueryContradiction,
  QueryPredicateClause,
  QueryRangeClause,
  QueryRefusedClause,
  QuerySearchClause,
  QueryStateStandIn,
  TypedSymbolReading,
} from "./types.js";
import {
  canTakeEntry,
  countAppliedFilters,
  findContradictions,
  findMissingPart,
  findNextPart,
  findTabbableBeyond,
  isRangeBound,
  listChipClauses,
  nameRefused,
  readDraftId,
  readLabelsStandIn,
  readRangeBound,
  readTypedOperator,
  resolveTypedSymbol,
  speakClause,
  speakRange,
  spellCommandHref,
  spellOperand,
  suggestOptions,
  writeChoice,
} from "./utils/index.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar";

/** A field with no presets. */
const NO_PRESETS: readonly DataViewsQueryBarPreset[] = Object.freeze([]);

/** No suggestions: what the narrow, search-only entry offers. */
const NO_OPTIONS: readonly QueryBarOption[] = Object.freeze([]);

/** What a conjunct asks, its operator perhaps not yet chosen. */
type AskedConjunct = Pick<PredicateDraft, "field" | "operator" | "operands">;

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

/**
 * Whether two drafts stand for one clause: one chip, and, in a range's
 * chip, one bound.
 */
const isSameClause = (a: QueryBarDraft, b: QueryBarDraft): boolean =>
  readDraftId(a) === readDraftId(b) &&
  (a.kind !== "predicate" ||
    b.kind !== "predicate" ||
    a.origin?.ref.operator === b.origin?.ref.operator);

/**
 * The next part an Entry moves to, or null past either end. A range's
 * bound takes its value alone.
 */
const findNextPartOf = (
  draft: QueryBarDraft,
  part: QueryBarPart,
  backward: boolean,
): QueryBarPart | null =>
  isRangeBound(draft) ? null : findNextPart(draft, part, backward);

/** The search that applies, empty for none. */
const readAppliedSearch = (state: QueryStateStandIn): string =>
  state.slice.search ?? "";

/** Each refused filter or search, by its chip's id. */
const readRefusedIssues = (
  state: QueryStateStandIn,
): readonly { readonly id: string; readonly issue: QueryIssue }[] =>
  listChipClauses(state).flatMap((clause) =>
    clause.kind === "refused" ? [{ id: clause.id, issue: clause.issue }] : [],
  );

/** Two readings of the refusals that say the same. */
const isSameRefusedIssues = (
  a: ReturnType<typeof readRefusedIssues>,
  b: ReturnType<typeof readRefusedIssues>,
): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Two readings of the contradictions that say the same. */
const isSameContradictions = (
  a: readonly QueryContradiction[],
  b: readonly QueryContradiction[],
): boolean => JSON.stringify(a) === JSON.stringify(b);

/** A contradiction's key, stable while it stands. */
const readContradictionId = (contradiction: QueryContradiction): string =>
  `${contradiction.field}__${contradiction.kind}`;

/**
 * The toolbar item a chip's stop rests on: its first Segment, under the
 * chip's id, or a read-only chip's clear control.
 */
const readStopItem = (clause: QueryClause): string =>
  clause.kind === "refused" ? `${clause.id}:remove` : clause.id;

/** Whether an option can be chosen. */
const isSelectable = (option: QueryBarOption): boolean =>
  option.disabled !== true && option.current !== true;

/** Whether a clause holds all it needs to apply. */
const isComplete = (draft: QueryBarDraft): boolean =>
  findMissingPart(draft) === null;

/**
 * Whether a node is part of the bar's field: inside its root, and not in
 * a quick filter beside it, which a clause in the field ends before, as
 * it does before anything outside the bar.
 */
const isInField = (root: Element, node: Node | null): boolean =>
  node !== null &&
  root.contains(node) &&
  !(node instanceof Element && node.closest(".quick-filters") !== null);

/** Two operand lists holding the same values, in any order. */
const isSameSet = (
  a: readonly PredicateOperand[],
  b: readonly PredicateOperand[],
): boolean =>
  a.length === b.length && a.every((operand) => b.includes(operand));

/** Two conjuncts asking the same, their values in any order. */
const isSameConjunct = (a: Predicate, b: AskedConjunct): boolean =>
  a.field === b.field &&
  a.operator === b.operator &&
  isSameSet(a.operands, b.operands);

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
  presets,
  className,
  onKeyDown,
  onBlur,
  onPointerDownCapture,
  ...rest
}: DataViewsQueryBarProps): ReactElement {
  const {
    provider,
    messages,
    announce: announceToRoot,
  } = useDataViewsRoot("QueryBar");
  // While the sheet is open, the bar speaks through the sheet's region.
  const { regionRef, announce } = useSheetAnnouncer({
    announce: announceToRoot,
  });
  const { schema } = provider.collection;
  const { capabilities } = provider;
  // Each quick filter with the arrangement it takes, each field once.
  const quickFields = new Set<string>();
  const quick = (quickFilters ?? []).map((entry) => {
    const { field, arrangement } =
      typeof entry === "string"
        ? { field: entry, arrangement: undefined }
        : entry;
    const definition = schema.findField(field);
    if (definition === undefined) {
      throw new Error(
        `DataViews.QueryBar: the schema has no field "${field}" to show as a quick filter`,
      );
    }
    if (quickFields.has(field)) {
      throw new Error(
        `DataViews.QueryBar: the quick filter "${field}" is listed twice`,
      );
    }
    quickFields.add(field);
    return {
      field,
      arrangement: chooseArrangement(
        definition,
        arrangement,
        listOfferedOperators(definition, capabilities),
      ),
    };
  });
  for (const field of Object.keys(presets ?? {})) {
    if (schema.findField(field) === undefined) {
      throw new Error(
        `DataViews.QueryBar: the schema has no field "${field}" to offer presets for`,
      );
    }
  }
  const labels = readLabelsStandIn();
  const group = useQueryGroup({ provider });
  const hydrated = useIsHydrated();
  // Whether the location spells addresses, which every baseline link needs.
  const hasHref = useMemo(
    () => group.spellHref(group.state.get()) !== null,
    [group],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  // The narrow form's sheet, which the summary button shows.
  const sheetId = useId();
  // Each quick filter's panel, held so they hide as the sheet shows.
  const { collectPanel, hidePanels } = useQuickFilterPanels();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { session, dispatch } = useQueryBarSession({ provider, rootRef });
  const clauses = useClauseIds({ group });
  const readContradictions = useMemo(
    () => (state: QueryStateStandIn) => findContradictions(state.slice, schema),
    [schema],
  );
  const refusedIssues = useDataViewsValue(group.state, {
    select: readRefusedIssues,
    isEqual: isSameRefusedIssues,
  });
  const contradictions = useDataViewsValue(group.state, {
    select: readContradictions,
    isEqual: isSameContradictions,
  });
  // The contradictions already said, so each new one is said once; those
  // a link arrived with are shown, not said.
  const saidRef = useRef<ReadonlySet<string> | null>(null);
  const announceOutcome = useAnnounceOutcome({ provider, announce });
  useFieldOverflow({ rootRef });
  useLinkFocusHandoff({ rootRef, hydrated });
  // Narrow, the chips are hidden: the stop leaves them for the entry.
  const isNarrow = useNarrowMode({
    rootRef,
    entryRef,
    onNarrow: () => {
      if (sessionRef.current.activeItem !== ENTRY) moveStop(ENTRY);
      // The search chip is hidden too: an empty entry shows the search.
      const applied = readAppliedSearch(group.state.get());
      if (sessionRef.current.text === "" && applied !== "") {
        dispatch({ type: "typeText", text: applied });
      }
    },
    onWide: () => {
      // Widened with the sheet open, as a phone turned: the summary that
      // opened it is gone, so the sheet closes and focus goes to the entry.
      const sheet = rootRef.current?.ownerDocument.getElementById(sheetId);
      if (sheet instanceof HTMLDialogElement && sheet.open) {
        sheet.close();
        entryRef.current?.focus();
      }
      // The search chip shows the search again, so the entry gives it up.
      const applied = readAppliedSearch(group.state.get());
      if (applied !== "" && sessionRef.current.text === applied) {
        dispatch({ type: "typeText", text: "" });
      }
    },
  });
  // Narrow, the entry holding the applied search follows it as it moves
  // elsewhere, as the sheet's removal or Back does.
  const appliedSearch = useDataViewsValue(group.state, {
    select: readAppliedSearch,
  });
  const appliedSearchRef = useRef(appliedSearch);
  // @note Impure: moves the entry's text with the applied search.
  useEffect(() => {
    const before = appliedSearchRef.current;
    appliedSearchRef.current = appliedSearch;
    if (
      isNarrow &&
      before !== appliedSearch &&
      sessionRef.current.text === before
    ) {
      dispatch({ type: "typeText", text: appliedSearch });
    }
  }, [appliedSearch, isNarrow, dispatch]);
  // What was typed in the plain input before scripts ran is kept.
  // @note Impure: reads the entry as the server drew it.
  useLayoutEffect(() => {
    const entry = entryRef.current;
    /* v8 ignore next -- unreachable: the entry renders before its effects run */
    if (entry === null) return;
    if (entry.value !== (group.state.get().slice.search ?? "")) {
      dispatch({ type: "typeText", text: entry.value });
    }
  }, [group, dispatch]);
  // @note Impure: says each contradiction a commit brings, once.
  useEffect(() => {
    const ids = new Set(contradictions.map(readContradictionId));
    const said = saidRef.current;
    saidRef.current = ids;
    if (said === null) return;
    for (const contradiction of contradictions) {
      if (!said.has(readContradictionId(contradiction))) {
        announce(
          messages.queryContradiction({
            label: labels.readFieldLabel(contradiction.field),
          }),
        );
      }
    }
  }, [contradictions, announce, messages, labels]);
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
  // A typed value's text as its Entry opens on it: the held value spelled.
  const heldOperand =
    isEditing && part === "value" && draft?.kind === "predicate"
      ? draft.operands.at(0)
      : undefined;
  const openingValue =
    heldOperand === undefined || editedDefinition?.kind === "choices"
      ? ""
      : spellOperand(editedDefinition, heldOperand, messages.decimalSeparator);
  // Narrow, the entry is search-only: clauses are added in the sheet.
  const options = isNarrow
    ? NO_OPTIONS
    : suggestOptions({
        part: isEditing ? part : "field",
        draft: isEditing ? draft : null,
        typed: isEditing ? typed : text,
        schema,
        capabilities,
        messages,
        labels,
        facets,
        // A range's bound keeps its operator: it takes no preset.
        presets:
          isEditing && draft?.kind === "predicate" && !isRangeBound(draft)
            ? (presets?.[draft.field] ?? NO_PRESETS)
            : NO_PRESETS,
        // The value an edit opens with narrows no preset; what is typed does.
        presetFilter: typed === openingValue ? "" : typed,
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
    const { draft: open } = current;
    const { origin } = open;
    /* v8 ignore next -- unreachable: the search is edited in the free-text entry, never in an Entry */
    const operator = open.kind === "predicate" ? open.operator : null;
    dispatch(
      origin === null
        ? { type: "close", item: ENTRY, focus: null }
        : {
            type: "close",
            item: origin.id,
            focus: way === "enter" ? current.part : null,
            operator,
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
    // A preset's label typed whole takes the preset.
    const presetOptions = options.filter(
      ({ choice }) => choice.kind === "preset",
    );
    const named = presetOptions.find(
      ({ label: name }) =>
        name.toLocaleLowerCase() === entered.trim().toLocaleLowerCase(),
    );
    if (named !== undefined) {
      return writeChoice(current, named.choice, schema, capabilities);
    }
    const read = schema.validateInput(current.field, entered, decimalSeparator);
    if (read.status === "valid") return { ...current, operands: read.operands };
    // Text that reads as no value but narrows to one preset takes it.
    const [only, ...others] = presetOptions;
    if (only !== undefined && others.length === 0) {
      return writeChoice(current, only.choice, schema, capabilities);
    }
    return {
      reason:
        read.status === "invalid"
          ? read.reason
          : messages.filterIncomplete(false),
    };
  };

  /**
   * The option typed text narrows to: one whose label it spells whole,
   * else the first value, a preset only where no value is left, so a
   * preset never takes the place of the value typed.
   */
  const findNarrowed = (entered: string): QueryBarOption | undefined => {
    const open = options.filter((option) => option.disabled !== true);
    const wanted = entered.trim().toLocaleLowerCase();
    return (
      open.find((option) => option.label.toLocaleLowerCase() === wanted) ??
      open.find(({ choice }) => choice.kind !== "preset") ??
      open.at(0)
    );
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

  /**
   * The applied clause holding a conjunct, as the draft an edit of it
   * starts from: its own chip's, or one bound of a range's.
   */
  const findStanding = (held: AskedConjunct): QueryBarDraft | undefined => {
    for (const clause of listChipClauses(group.state.get())) {
      if (
        clause.kind === "predicate" &&
        isSameConjunct(clause.predicate, held)
      ) {
        return readAppliedDraft(clause);
      }
      if (clause.kind === "range") {
        if (isSameConjunct(clause.lower, held)) {
          return readRangeBound(clause, 0, clause.lower);
        }
        if (isSameConjunct(clause.upper, held)) {
          return readRangeBound(clause, 1, clause.upper);
        }
      }
    }
    return undefined;
  };

  /** The id the clause stands under once it applies. */
  const findAppliedId = (next: PredicateDraft): string => {
    const found = findStanding(next)?.origin?.id;
    /* v8 ignore next -- unreachable: a clause that applied is in the query */
    return found ?? ENTRY;
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
        operator: next.operator,
      });
      return;
    }
    // A clause the query already holds adds nothing, and says nothing.
    if (origin === null && findStanding(next) !== undefined) {
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
      operator: next.operator,
    });
  };

  /**
   * Mark what the Entry holds invalid, and say why: the Entry's own
   * description is not read again while it keeps focus.
   */
  const markInvalid = (reason: string): void => {
    dispatch({ type: "invalid", reason });
    // Said as the line below the field shows it: for an edit, that what
    // applied before still does.
    announce(
      messages.filterRefused(
        [messages.clauseInvalid(reason)],
        sessionRef.current.draft?.origin != null,
      ),
    );
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
  // At one identity, so a quick filter's props stay the same.
  const announceQuickRefusals = useStableCallback(announceRefusals);
  /**
   * Say what a quick filter's commit did, with the result count once it
   * lands, as a commit in the bar does: the field's clauses added, changed
   * or removed.
   */
  const announceQuickCommit = useStableCallback(
    (name: string, before: readonly Predicate[]): void => {
      const after = listFieldConjuncts(group.state.get(), name).map(
        ({ predicate }) => predicate,
      );
      // A commit that changed nothing says nothing.
      if (JSON.stringify(after) === JSON.stringify(before)) return;
      const speak = (said: readonly Predicate[]): string =>
        said
          .map(({ field: at, operator, operands }) =>
            speakClause(
              {
                kind: "predicate",
                origin: null,
                field: at,
                operator,
                operands,
              },
              schema,
              labels,
              messages,
            ),
          )
          .join(", ");
      const noun = labels.recordNoun;
      announceOutcome((count) =>
        before.length === 0
          ? messages.clauseAdded(speak(after), count, noun)
          : after.length === 0
            ? messages.clauseRemoved(speak(before), count, noun)
            : messages.clauseChanged(speak(after), count, noun),
      );
    },
  );
  // Said as the line below a field shows it, once per commit that fails.
  const announceQuickInvalid = useStableCallback((message: string): void => {
    announce(message);
  });

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
    // What is typed takes the option it narrows to, the held one among
    // them, which keeps the clause as it is.
    const first = isTakingFirst ? findNarrowed(current.typed) : undefined;
    if (first?.current === true) {
      const target = findNextPartOf(current.draft, at, false);
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
        ? findNarrowed(current.typed)
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
    // In a range's chip, Tab moves from the lower bound to the upper, and
    // Shift+Tab back; past either end the range commits.
    const isLower = current.draft.origin?.ref.operator === "gte";
    if (isRangeBound(current.draft) && isLower !== backward) {
      if ("reason" in read) {
        markInvalid(read.reason);
        return;
      }
      moveToOtherBound(read, isLower);
      return;
    }
    const target0 = findNextPartOf(current.draft, at, backward);
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
    const target = findNextPartOf(written, at, backward);
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

  /**
   * Write a range's open bound, then open its other bound, read again from
   * the query: the two may no longer make a range once one is written.
   */
  const moveToOtherBound = (
    written: PredicateDraft,
    toUpper: boolean,
  ): void => {
    const { origin } = written;
    /* v8 ignore next -- unreachable: a range's bound edits an applied clause */
    if (origin === null) return;
    const range = listChipClauses(group.state.get()).find(
      (clause): clause is QueryRangeClause => clause.id === origin.id,
    );
    /* v8 ignore next -- unreachable: an open bound's range stands until it is written */
    if (range === undefined) return;
    const other = toUpper ? range.upper : range.lower;
    if (!isSameConjunct(origin.held, written)) {
      const refusals = write(written);
      if (refusals.length > 0) {
        markInvalid(refusals.map(({ reason }) => reason).join("; "));
        return;
      }
      const spoken = speakClause(written, schema, labels, messages);
      announceOutcome((count) =>
        messages.clauseChanged(spoken, count, labels.recordNoun),
      );
    }
    const standing = findStanding(other);
    /* v8 ignore next -- unreachable: writing one bound leaves the other standing */
    if (standing === undefined || standing.kind !== "predicate") return;
    openPart(standing, "value");
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
    const applied = readAppliedSearch(group.state.get());
    // Narrow, the entry holds the search: emptied, Enter clears it.
    if (typedText === "" && isNarrow && applied !== "") {
      event.preventDefault();
      const refusals = group.setSearch("");
      if (refusals.length > 0) {
        announceRefusals(refusals);
        return;
      }
      const spoken = messages.searchClause(applied);
      announceOutcome((count) =>
        messages.clauseRemoved(spoken, count, labels.recordNoun),
      );
      return;
    }
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
    // Narrow, the chips are hidden: the entry keeps the search it applies.
    const kept = isNarrow ? typedText : "";
    if (typedText === applied) {
      // The search already applies: nothing to write or say.
      dispatch({ type: "typeText", text: kept });
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
    dispatch({ type: "typeText", text: kept });
  };

  /**
   * A press on another chip than the one whose Entry is open ends the open
   * clause as a stop move does: a complete clause applies, another is
   * cancelled. Then the pressed clause is read again, since ids can shift
   * after a commit.
   */
  const endOtherClause = (pressed: QueryBarDraft): QueryBarDraft => {
    const { draft: open } = sessionRef.current;
    if (open === null || isSameClause(open, pressed)) return pressed;
    leave(highlighted, true);
    if (pressed.kind === "search") return pressed;
    /* v8 ignore next -- unreachable: an applied clause is pressed, never the draft */
    const standing = pressed.origin && findStanding(pressed.origin.held);
    /* v8 ignore next -- unreachable: ending one clause leaves every other standing */
    return standing ?? pressed;
  };

  // A refused chip holds a stop only where its parameter can be cleared.
  const isClearable = readProviderHost(provider).location !== null;
  const hasStop = (clause: QueryClause): boolean =>
    clause.kind !== "refused" || isClearable;
  /** The chips that hold a stop, in order, as the query now stands. */
  const listStops = (): readonly QueryClause[] =>
    listChipClauses(group.state.get()).filter(hasStop);

  /**
   * Remove a chip's clause by a write, and move the stop to the next chip,
   * else the previous, else the entry, by position, since ids renumber
   * after a removal. The place is read before the write and after any open
   * clause ended, since that may stand ahead.
   */
  const removeChip = (
    id: string,
    spoken: string,
    command: () => readonly SourceRefusal[],
  ): void => {
    const index = listStops().findIndex((clause) => clause.id === id);
    const refusals = command();
    if (refusals.length > 0) {
      announceRefusals(refusals);
      return;
    }
    const rest = listStops();
    const next = rest.at(index) ?? rest.at(index - 1);
    announceOutcome((count) =>
      messages.clauseRemoved(spoken, count, labels.recordNoun),
    );
    dispatch({
      type: "close",
      item: next === undefined ? ENTRY : readStopItem(next),
      focus: null,
    });
  };

  /** Remove a clause, a complete open one applying first. */
  const remove = useStableCallback((pressed: QueryBarDraft): void => {
    const applied = endOtherClause(pressed);
    const { origin } = applied;
    /* v8 ignore next -- unreachable: an applied clause has its place, and a draft is cancelled instead */
    if (origin === null) return;
    removeChip(origin.id, speakClause(applied, schema, labels, messages), () =>
      origin.ref === null
        ? group.setSearch("")
        : group.removePredicate(origin.ref),
    );
  });

  /**
   * Remove a range: both bounds in one write, so one step undoes it. An
   * open clause on another chip applies first; where it splits the range,
   * whichever pressed bounds still stand go, in one write.
   */
  const removeRange = useStableCallback((pressed: QueryRangeClause): void => {
    const { draft: open } = sessionRef.current;
    if (open !== null && readDraftId(open) !== pressed.id) {
      leave(highlighted, true);
    }
    const standing = listChipClauses(group.state.get()).find(
      (clause): clause is QueryRangeClause =>
        clause.kind === "range" && clause.field === pressed.field,
    );
    if (standing !== undefined) {
      removeChip(
        standing.id,
        speakRange(standing.lower, standing.upper, schema, labels, messages),
        () => group.editPredicates({ remove: [...standing.refs], add: [] }),
      );
      return;
    }
    const bounds = [pressed.lower, pressed.upper].flatMap((bound) => {
      const found = findStanding(bound);
      return found?.kind === "predicate" && found.origin !== null
        ? [found.origin]
        : [];
    });
    const [first] = bounds;
    if (first === undefined) return;
    removeChip(
      first.id,
      speakRange(pressed.lower, pressed.upper, schema, labels, messages),
      () =>
        group.editPredicates({
          remove: bounds.map(({ ref }) => ref),
          add: [],
        }),
    );
  });

  /**
   * Clear a refused parameter the link carried, an open clause applying
   * first.
   */
  const clearRefused = useStableCallback(
    (pressed: QueryRefusedClause): void => {
      if (sessionRef.current.draft !== null) leave(highlighted, true);
      // A clause on its field that applied first replaces the refusal: its
      // own commit has said so.
      const standing = listChipClauses(group.state.get()).some(
        (clause) =>
          clause.kind === "refused" &&
          clause.id === pressed.id &&
          clause.issue.parameter === pressed.issue.parameter,
      );
      if (!standing) return;
      const name = nameRefused(pressed.issue, labels, messages);
      removeChip(pressed.id, name, () => {
        readProviderHost(provider).clearRefused(pressed.issue.parameter);
        return [];
      });
    },
  );

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
        current.draft !== null && isSameClause(current.draft, applied);
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
    const last = clauses.filter(hasStop).at(-1);
    if (
      item === ENTRY &&
      event.key === "Backspace" &&
      text === "" &&
      last &&
      !isNarrow
    ) {
      // Backspace in the empty entry selects the last chip.
      event.preventDefault();
      dispatch({ type: "moveStop", item: readStopItem(last) });
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
      if (reading === undefined) return;
      if (reading.kind === "range") removeRange(reading);
      else if (reading.kind === "refused") clearRefused(reading);
      else remove(readAppliedDraft(reading));
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
    // Narrow, the chips are hidden, and the entry is the only item.
    if (!target.closest('[role="toolbar"]') || isNarrow) return;
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
      if (!isInField(root, next)) leave(optionId);
      return;
    }
    const check = (): void => {
      if (!isInField(root, document.activeElement)) leave(optionId);
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

  const clearHref = hydrated ? null : spellClearHref();
  /**
   * Where the clear control leads before scripts: the query without its
   * filters and search, every refused filter and search the address
   * carries dropped too, as clearing them with scripts does.
   */
  function spellClearHref(): string | null {
    const href = spellCommandHref(group, {
      kind: "clear",
      paths: ["filter", "search"],
    });
    if (href === null) return null;
    const params = new URLSearchParams(href);
    for (const issue of group.state.get().refused) {
      if (isNarrowingIssue(issue)) params.delete(issue.parameter);
    }
    return `?${params.toString()}`;
  }
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
          // Before scripts, a link to the query without either.
          ...(clearHref === null ? {} : { clearHref }),
        }
      : {};

  /**
   * Merge a contradiction's clauses into what was likely meant, in one
   * write, and move focus to the chip they became. An open clause applies
   * first, as before any other chip's action; the contradiction is read
   * again after it, since a commit can resolve it or move its clauses.
   */
  const merge = (pressed: QueryContradiction): void => {
    if (sessionRef.current.draft !== null) leave(highlighted, true);
    const contradiction = findContradictions(
      group.state.get().slice,
      schema,
    ).find(
      ({ field, kind }) => field === pressed.field && kind === pressed.kind,
    );
    const edit = contradiction?.merge;
    // Resolved, or left with no one reading, by the clause that applied.
    if (contradiction === undefined || edit === null || edit === undefined) {
      return;
    }
    const refusals = group.editPredicates(edit);
    if (refusals.length > 0) {
      announceRefusals(refusals);
      return;
    }
    const label = labels.readFieldLabel(contradiction.field);
    announceOutcome((count) =>
      messages.clausesMerged({ label, count, noun: labels.recordNoun }),
    );
    const [merged] = edit.add;
    /* v8 ignore next -- unreachable: a merge adds the clause it becomes */
    const id = merged && findStanding(merged)?.origin?.id;
    /* v8 ignore next -- unreachable: the clause a merge adds applies */
    if (id === undefined) return;
    dispatch({ type: "close", item: id, focus: "field" });
  };

  // Each refused filter or search, with its reason, for the eye: the
  // chip's clear control is described by it, and nothing says it twice.
  const refusedEntries = refusedIssues.map(
    ({ id, issue }): MessageLineEntry => ({
      id,
      criticality: "error",
      text: messages.clauseRefused(
        nameRefused(issue, labels, messages),
        issue.reason,
      ),
    }),
  );

  /**
   * Merge as the message line offers it: a button once scripts run; before
   * they do, a link to the merged query where there is an address, and
   * nothing where there is none.
   */
  const readMergeAction = (
    contradiction: QueryContradiction,
    label: string,
  ): Pick<MessageLineEntry, "action"> => {
    const { merge: edit } = contradiction;
    if (edit === null) return {};
    const name = messages.mergeClauses({ label });
    if (hydrated) {
      return { action: { label: name, onAction: () => merge(contradiction) } };
    }
    const href = spellCommandHref(group, { kind: "editPredicates", ...edit });
    return href === null ? {} : { action: { label: name, href } };
  };

  const contradictionEntries = contradictions.map(
    (contradiction): MessageLineEntry => {
      const label = labels.readFieldLabel(contradiction.field);
      return {
        id: readContradictionId(contradiction),
        criticality: "warning",
        text: messages.queryContradiction({ label }),
        ...readMergeAction(contradiction, label),
      };
    },
  );
  // What the open Entry holds that cannot apply, and that what applied
  // before still does, for as long as the Entry stays open; each refused
  // filter or search; then each field whose clauses cannot all hold, with
  // its merge where one stands out.
  const entries: MessageLineEntry[] = [
    ...(session.invalid === null || draft === null
      ? []
      : [
          {
            id: "invalid",
            criticality: "error",
            text: messages.filterRefused(
              [messages.clauseInvalid(session.invalid)],
              draft.origin !== null,
            ),
          } as const,
        ]),
    ...refusedEntries,
    ...contradictionEntries,
  ];

  const edit =
    draft !== null && draft.origin !== null && part !== null
      ? { draft, part, typed, invalid: session.invalid }
      : null;

  const field = (
    <QueryInput
      ref={entryRef}
      // Narrow, the entry only searches, and is named and prompted so.
      label={
        label ??
        (isNarrow
          ? messages.searchEntry({ noun: labels.recordNoun })
          : messages.queryBar(labels.recordNoun))
      }
      // Narrow, the keys the description names reach no chip.
      description={isNarrow ? undefined : messages.queryBarDescription}
      placeholder={
        isNarrow
          ? messages.searchEntryPlaceholder
          : messages.queryBarPlaceholder
      }
      // Before scripts, the plain input holds the applied search.
      value={hydrated ? text : (group.state.get().slice.search ?? "")}
      {...(hasHref ? { name: QUERY_KEYS.search } : {})}
      onValueChange={(entered) => dispatch({ type: "typeText", text: entered })}
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
      {/* Narrow, the chips are the sheet's: the entry holds none, so it
          shows its prompt. Before scripts, the stylesheet hides them. */}
      {!isNarrow && (clauses.length > 0 || draft?.origin === null) && (
        <QueryChips label={messages.appliedFilters}>
          {clauses.map((clause) =>
            clause.kind === "refused" ? (
              <RefusedChip
                key={clause.id}
                clause={clause}
                group={group}
                onClear={clearRefused}
              />
            ) : clause.kind === "range" ? (
              <RangeChip
                key={clause.id}
                clause={clause}
                group={group}
                edit={edit?.draft.origin?.id === clause.id ? edit : null}
                onActivate={activate}
                onRemove={removeRange}
                onTypedChange={handleTypedChange}
                onEntryKeyDown={handleEntryKeyDown}
              />
            ) : (
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
            ),
          )}
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
  );

  const search = <SearchForm hasHref={hasHref}>{field}</SearchForm>;

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the bar hears the keys that bubble from the toolbar's items */}
      <div
        {...rest}
        ref={rootRef}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
        // Until scripts run, nothing moves the rows below the field, so the
        // field stays in flow.
        data-hydrated={hydrated || undefined}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPointerDownCapture={handlePointerDownCapture}
      >
        {quick.length === 0 ? (
          search
        ) : (
          <div className="line">
            {search}
            <div className="quick-filters">
              {quick.map(({ field: name, arrangement }) => (
                <QuickFilter
                  key={name}
                  field={name}
                  arrangement={arrangement}
                  group={group}
                  hasHref={hasHref}
                  panelRef={collectPanel(name)}
                  onRefused={announceQuickRefusals}
                  onCommitted={announceQuickCommit}
                  onInvalid={announceQuickInvalid}
                />
              ))}
            </div>
          </div>
        )}
        <SummaryButton
          className="summary"
          sheetId={sheetId}
          group={group}
          onShow={() => {
            hidePanels();
            setSheetOpen(true);
          }}
        />
        <MessageLine className="messages" entries={entries} />
        {hasHref && !hydrated && (
          <FiltersDisclosure
            className="filters"
            applied={countAppliedFilters(clauses)}
          />
        )}
      </div>
      {/* Beside the bar, not in it: the bar's keys and blur never hear the
          sheet, and its modal dialog is drawn in the top layer anyway. */}
      <Sheet
        id={sheetId}
        group={group}
        hasHref={hasHref}
        isOpen={isSheetOpen}
        onOpenChange={setSheetOpen}
        regionRef={regionRef}
        announce={announce}
      />
    </>
  );
}
