import type { RefObject } from "react";

/** What `useOpenShortcut` takes: the palette's dialog and its opening. */
export type UseOpenShortcutProps = {
  /** The palette's dialog, which the chord opens. */
  readonly dialog: RefObject<HTMLDialogElement | null>;
  /** Called on the chord, just before the closed dialog opens. */
  readonly onOpen: () => void;
};

/** What `useOpenShortcut` returns: nothing; it only listens. */
export type UseOpenShortcutResult = undefined;
