import readDraftId from "./readDraftId.js";
import type {
  QueryBarDraft,
  QueryBarSession,
  QueryBarSessionAction,
} from "./types.js";

/** The roving items a draft's chip holds: its first Segment and its Entry. */
const listDraftItems = (draft: QueryBarDraft): readonly string[] => {
  const id = readDraftId(draft);
  return [id, `${id}:entry`];
};

/** The session with no chip holding an Entry, the stop on one item. */
const close = (
  session: QueryBarSession,
  item: string,
  focus: QueryBarSession["focus"],
): QueryBarSession => ({
  ...session,
  draft: null,
  part: null,
  typed: "",
  invalid: null,
  activeItem: item,
  focus,
});

/**
 * The query bar's edit session, as one reducer: what is typed in the
 * free-text entry and in a chip's Entry, the clause that Entry builds or
 * edits, the part it takes, and where the stop rests. Opening an Entry
 * puts the stop on it, and a clause built from the free-text entry takes
 * its text; closing one rests the stop on an item and, for an edit, names
 * the Segment that takes focus; the stop leaving the Entry's chip for
 * another item ends its edit unwritten. It holds no copy of what applies:
 * a commit is the bar's to write, and closing is all the session hears of
 * it. Pure.
 *
 * @param session - The session.
 * @param action - What happened.
 * @returns The next session.
 */
export default function reduceSession(
  session: QueryBarSession,
  action: QueryBarSessionAction,
): QueryBarSession {
  switch (action.type) {
    case "typeText":
      return { ...session, text: action.text };
    case "typePart":
      return { ...session, typed: action.text, invalid: null };
    case "edit": {
      const isStart = session.draft === null && action.draft.origin === null;
      return {
        ...session,
        // The field chosen from the free-text entry was its text.
        text: isStart ? "" : session.text,
        draft: action.draft,
        part: action.part,
        typed: action.typed,
        invalid: null,
        activeItem: `${readDraftId(action.draft)}:entry`,
        focus: null,
      };
    }
    case "invalid":
      return { ...session, invalid: action.reason };
    case "close":
      return close(
        session,
        action.item,
        action.focus === null
          ? null
          : { item: action.item, part: action.focus },
      );
    case "moveStop":
      // A press on one of the chip's own parts claims its item first, before
      // the part's activation moves the Entry there, so the edit stays.
      return session.draft !== null &&
        !listDraftItems(session.draft).includes(action.item)
        ? close(session, action.item, null)
        : { ...session, activeItem: action.item, focus: null };
    case "focused":
      return { ...session, focus: null };
  }
}
