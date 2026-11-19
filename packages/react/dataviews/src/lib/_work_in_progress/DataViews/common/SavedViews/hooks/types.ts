/**
 * Hook domain types for the SavedViews part: the focus hook's props and
 * result.
 */

import type { FocusEvent, MouseEvent, RefObject, SyntheticEvent } from "react";

/** What the focus hook takes: the state that holds the focus back. */
export type UsePanelFocusProps = {
  /** Whether a command is in flight; the focus waits for it to settle. */
  readonly pending: boolean;
};

/** What the focus hook returns: its handlers and the refs the focus moves between. */
export type UsePanelFocusResult = {
  /** The view select, where a stranded focus lands. */
  readonly select: RefObject<HTMLSelectElement | null>;
  /** Try again, where a stranded focus lands while the select is disabled. */
  readonly retry: RefObject<HTMLButtonElement | null>;
  /** Record the command that opens a dialog, which the focus returns to. */
  readonly recordOpener: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * As a dialog closes, send the focus back to its command once nothing is
   * pending, if the platform could not: the command was disabled meanwhile.
   */
  readonly restoreFocus: (event: SyntheticEvent<HTMLDialogElement>) => void;
  /** Record where the focus is inside the control, so its loss can be seen. */
  readonly recordFocus: (event: FocusEvent<HTMLElement>) => void;
  /** Record that the focus left an element, and where it went. */
  readonly recordBlur: (event: FocusEvent<HTMLElement>) => void;
};
