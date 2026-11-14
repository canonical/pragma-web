import { ENTRY_ITEM_ID as ENTRY } from "../../lib/_work_in_progress/QueryInput/common/constants.js";
import canTakeEntry from "./canTakeEntry.js";
import { PARTS } from "./constants.js";
import findNextPart from "./findNextPart.js";
import type { Clause, Part, QueryAction, QueryState } from "./types.js";

/** The roving item of a chip's Entry. */
const findEntryItem = (id: string): string => `${id}:entry`;

/** The first part a clause still lacks. */
const findMissingPart = (clause: Clause): Part | undefined =>
  PARTS.find((part) => !clause[part]);

/** Opens a chip's Entry on one part, with the stop on it. */
const openEdit = (
  state: QueryState,
  clause: Clause,
  part: Part,
  isDraft: boolean,
): QueryState => ({
  ...state,
  edit: {
    id: clause.id,
    part,
    text: "",
    isDraft,
    // An edit keeps the clause it started from, across its parts.
    original: state.edit?.id === clause.id ? state.edit.original : clause,
  },
  activeItem: findEntryItem(clause.id),
  focusPart: undefined,
});

/**
 * Ends the open edit without a choice. A draft is dropped and the stop
 * returns to the entry; an edited chip gets its clause back, and the stop
 * and focus return to the part that was being edited.
 */
const cancelEdit = (state: QueryState): QueryState => {
  const { edit } = state;
  if (!edit) return state;
  if (edit.isDraft) {
    return {
      ...state,
      clauses: state.clauses.filter(({ id }) => id !== edit.id),
      edit: undefined,
      activeItem: ENTRY,
    };
  }
  return {
    ...state,
    clauses: state.clauses.map((clause) =>
      clause.id === edit.id && edit.original ? edit.original : clause,
    ),
    edit: undefined,
    activeItem: edit.id,
    focusPart: { id: edit.id, part: edit.part },
  };
};

/** Writes the chosen option into the open edit's part. */
const writePart = (state: QueryState, optionId: string): QueryState => {
  const { edit } = state;
  const clause = state.clauses.find(({ id }) => id === edit?.id);
  if (!edit || !clause) return state;
  // A new field has values of its own, so the old value goes.
  const { value: _value, ...withoutValue } = clause;
  const chosen: Clause =
    edit.part === "field" && clause.field !== optionId
      ? { ...withoutValue, field: optionId }
      : { ...clause, [edit.part]: optionId };
  return {
    ...state,
    clauses: state.clauses.map((item) => (item.id === edit.id ? chosen : item)),
  };
};

/**
 * Commits the open edit, as Tab past a chip's last or first part, or focus
 * leaving, does: a complete clause stays as it now is, and the stop returns
 * to the entry from a draft, or to the edited part. An incomplete clause is
 * cancelled instead.
 */
const commitEdit = (state: QueryState): QueryState => {
  const { edit } = state;
  const clause = state.clauses.find(({ id }) => id === edit?.id);
  if (!edit || !clause || findMissingPart(clause)) return cancelEdit(state);
  return edit.isDraft
    ? { ...state, edit: undefined, activeItem: ENTRY, focusPart: undefined }
    : {
        ...state,
        edit: undefined,
        activeItem: edit.id,
        focusPart: { id: edit.id, part: edit.part },
      };
};

/** Writes the chosen option into the open edit's part, and moves on. */
const choosePart = (state: QueryState, optionId: string): QueryState => {
  const { edit } = state;
  const next = writePart(state, optionId);
  const chosen = next.clauses.find(({ id }) => id === edit?.id);
  if (!edit || !chosen) return state;
  const missing = findMissingPart(chosen);
  if (missing) return openEdit(next, chosen, missing, edit.isDraft);
  // A built chip sends the stop back to the entry; an edited one keeps it,
  // on the part that was chosen.
  return edit.isDraft
    ? { ...next, edit: undefined, activeItem: ENTRY }
    : {
        ...next,
        edit: undefined,
        activeItem: edit.id,
        focusPart: { id: edit.id, part: edit.part },
      };
};

/**
 * The rules of a query being built, in one place, as a query bar applies
 * them: choosing a field in the entry starts a draft chip whose Entry takes
 * each missing part; activating a part edits it; Tab moves an edit between
 * parts, writing what was chosen; Tab past the last or first part, and focus
 * leaving, commit the edit; any other move of the stop away from the open
 * Entry, and Escape, cancel it; removing or clearing drops clauses.
 *
 * @param state - The query being built.
 * @param action - What happened.
 * @returns The next state.
 */
export default function reduceQuery(
  state: QueryState,
  action: QueryAction,
): QueryState {
  switch (action.type) {
    case "typeText":
      return { ...state, text: action.text };
    case "typePart":
      return state.edit
        ? { ...state, edit: { ...state.edit, text: action.text } }
        : state;
    case "choose": {
      if (state.edit) return choosePart(state, action.optionId);
      const draft: Clause = {
        id: `clause-${state.nextId}`,
        field: action.optionId,
      };
      return openEdit(
        {
          ...state,
          clauses: [...state.clauses, draft],
          text: "",
          nextId: state.nextId + 1,
        },
        draft,
        "operator",
        true,
      );
    }
    case "editPart": {
      const base =
        state.edit && state.edit.id !== action.id ? cancelEdit(state) : state;
      const clause = base.clauses.find(({ id }) => id === action.id);
      // A part that would leave the chip without a Segment keeps its text.
      return clause && canTakeEntry(clause, action.part)
        ? openEdit(base, clause, action.part, base.edit?.isDraft ?? false)
        : base;
    }
    case "movePart": {
      const written =
        action.optionId === undefined
          ? state
          : writePart(state, action.optionId);
      const clause = written.clauses.find(({ id }) => id === written.edit?.id);
      const target = findNextPart(written, action.backward);
      // Past the first or the last part, the edit is committed.
      if (!written.edit || !clause || !target) return commitEdit(written);
      if (!canTakeEntry(clause, target)) {
        // A chip keeps one Segment, so a draft's field, its only one, goes
        // back to the entry as text, to be chosen again.
        return {
          ...written,
          clauses: written.clauses.filter(({ id }) => id !== clause.id),
          text: clause.field,
          edit: undefined,
          activeItem: ENTRY,
          focusPart: undefined,
        };
      }
      return openEdit(written, clause, target, written.edit.isDraft);
    }
    case "moveStop": {
      // The stop leaving the open Entry's chip ends its edit. A press on one
      // of that chip's own parts claims the chip's item first, before the
      // part's activation moves the edit there, so the edit stays.
      const isSameChip =
        state.edit !== undefined &&
        [state.edit.id, findEntryItem(state.edit.id)].includes(action.item);
      return {
        ...(state.edit && !isSameChip ? cancelEdit(state) : state),
        activeItem: action.item,
        focusPart: undefined,
      };
    }
    case "cancelEdit":
      return cancelEdit(state);
    case "leave": {
      // Focus left the field: the edit is committed, and focus stays where
      // it went.
      const written =
        action.optionId === undefined
          ? state
          : writePart(state, action.optionId);
      return { ...commitEdit(written), focusPart: undefined };
    }
    case "remove": {
      // The stop moves off any open Entry, so another chip's edit ends
      // first: a draft is dropped, an edited chip restored.
      const base =
        state.edit && state.edit.id !== action.id ? cancelEdit(state) : state;
      const index = base.clauses.findIndex(({ id }) => id === action.id);
      const rest = base.clauses.filter(({ id }) => id !== action.id);
      // The stop moves to the next chip, else the previous one, else the entry.
      const next =
        index >= 0 ? (rest.at(index) ?? rest.at(index - 1)) : undefined;
      return {
        ...base,
        clauses: rest,
        edit: undefined,
        activeItem: next ? next.id : ENTRY,
        focusPart: undefined,
      };
    }
    case "clear":
      return {
        ...state,
        clauses: [],
        text: "",
        edit: undefined,
        activeItem: ENTRY,
        focusPart: undefined,
      };
  }
}
