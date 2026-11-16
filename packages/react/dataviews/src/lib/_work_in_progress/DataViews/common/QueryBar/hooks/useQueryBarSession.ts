import type { Predicate } from "@canonical/dataviews-core";
import {
  listConjuncts,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { useEffect, useReducer, useRef } from "react";
import { ENTRY_ITEM_ID } from "../../../../QueryInput/common/constants.js";
import readDraftId from "../readDraftId.js";
import reduceSession from "../reduceSession.js";
import type { QueryBarSession } from "../types.js";
import type {
  UseQueryBarSessionProps,
  UseQueryBarSessionResult,
} from "./types.js";

/** A session at rest: nothing typed, no Entry, the stop on the entry. */
const IDLE: QueryBarSession = {
  text: "",
  draft: null,
  part: null,
  typed: "",
  invalid: null,
  activeItem: ENTRY_ITEM_ID,
  focus: null,
};

/** The moves of the query that come from outside the bar. */
const OUTSIDE_CAUSES: ReadonlySet<string> = new Set([
  "adopt",
  "view",
  "revert",
  "reset",
]);

/** Two conjuncts at one address holding the same values, in any order. */
const arePredicatesAlike = (a: Predicate, b: Predicate): boolean =>
  a.operands.length === b.operands.length &&
  a.operands.every((operand) => b.operands.includes(operand));

/** Whether focus is in the bar, or lost because its element went away. */
const isFocusHere = (root: HTMLElement): boolean => {
  const active = document.activeElement;
  return active === null || active === document.body || root.contains(active);
};

/**
 * The query bar's edit session and its effects: the reducer, ended when
 * Back or Forward moves the query under it, and focus moved where the
 * session says, only while focus is in the bar. After an edit the Segment
 * that took the Entry's place takes focus, a task later, past the stop's
 * own arrival on the chip's first part; when the Entry moves to another
 * part, it takes focus back.
 *
 * @param props - The provider, whose transitions end the session, and the
 *   bar's root.
 * @returns The session and its dispatch.
 * @note Impure: subscribes to the provider's transitions, and moves focus.
 */
export default function useQueryBarSession({
  provider,
  rootRef,
}: UseQueryBarSessionProps): UseQueryBarSessionResult {
  const [session, dispatch] = useReducer(reduceSession, IDLE);
  const draftRef = useRef(session.draft);
  draftRef.current = session.draft;

  // A move of the query from outside the bar ends the session: Back or
  // Forward, a saved view opened, reverted to or left, or a reset. So does
  // the clause being edited leaving the query, by any write.
  useEffect(() => {
    const { transitions } = readProviderHost(provider);
    const end = (): void => {
      dispatch({ type: "close", item: ENTRY_ITEM_ID, focus: null });
    };
    const stopTransitions = transitions.subscribe(() => {
      const cause = transitions.get()?.cause;
      if (
        draftRef.current !== null &&
        cause !== undefined &&
        OUTSIDE_CAUSES.has(cause)
      ) {
        end();
      }
    });
    const stopState = provider.state.subscribe(() => {
      const origin = draftRef.current?.origin;
      if (origin === undefined || origin === null || origin.ref === null) {
        return;
      }
      const { ref, held } = origin;
      const { slice } = provider.state.get();
      const standing = listConjuncts(slice, ref.field, ref.operator).at(
        ref.nth,
      );
      // Gone, or another conjunct now at its place after a sibling left.
      if (standing === undefined || !arePredicatesAlike(standing, held)) {
        end();
      }
    });
    return () => {
      stopTransitions();
      stopState();
    };
  }, [provider]);

  const { focus } = session;
  useEffect(() => {
    if (focus === null) return;
    const timer = setTimeout(() => {
      const root = rootRef.current;
      /* v8 ignore next -- unreachable: the root renders before its effects run */
      if (root === null) return;
      if (isFocusHere(root)) {
        // Looked up by id, which a field's name can make any text.
        root.ownerDocument
          .getElementById(focus.item)
          ?.querySelector<HTMLElement>(`[data-part="${focus.part}"]`)
          ?.focus();
      }
      dispatch({ type: "focused" });
    });
    return () => clearTimeout(timer);
  }, [focus, rootRef]);

  // The Entry moving to another part can move in the DOM, which drops focus.
  const entryItem =
    session.draft === null ? null : `${readDraftId(session.draft)}:entry`;
  const { part } = session;
  useEffect(() => {
    const root = rootRef.current;
    if (entryItem === null || part === null || root === null) return;
    if (!isFocusHere(root)) return;
    const entry = [
      ...root.querySelectorAll<HTMLInputElement>("input[data-roving-item]"),
    ].find((element) => element.dataset["rovingItem"] === entryItem);
    if (entry === undefined || entry === document.activeElement) return;
    entry.focus();
    // What the Entry opens with is typed on from its end.
    entry.setSelectionRange(entry.value.length, entry.value.length);
  }, [entryItem, part, rootRef]);

  return { session, dispatch };
}
