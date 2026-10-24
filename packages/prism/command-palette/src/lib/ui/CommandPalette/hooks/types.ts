import type { MouseEventHandler, PointerEventHandler, RefObject } from "react";

/** What `useOpenShortcut` takes: the palette's dialog and its opening. */
export type UseOpenShortcutProps = {
  /** The palette's dialog, which the chord opens. */
  readonly dialog: RefObject<HTMLDialogElement | null>;
  /** Called on the chord, just before the closed dialog opens. */
  readonly onOpen: () => void;
};

/** What `useOpenShortcut` returns: nothing; it only listens. */
export type UseOpenShortcutResult = undefined;

/**
 * What `useBackdropClose` takes: how to close the dialog, and the
 * consumer's own handlers for the events it listens to, which it calls
 * first.
 */
export type UseBackdropCloseProps = {
  /** Closes the dialog. */
  readonly close: () => void;
  /** The consumer's handler for a press on the dialog. */
  readonly onPointerDown?: PointerEventHandler<HTMLDialogElement>;
  /** The consumer's handler for a release on the dialog. */
  readonly onPointerUp?: PointerEventHandler<HTMLDialogElement>;
  /** The consumer's handler for a click on the dialog. */
  readonly onClick?: MouseEventHandler<HTMLDialogElement>;
};

/** What `useBackdropClose` returns: the dialog's handlers. */
export type UseBackdropCloseResult = {
  /** Records whether a press landed on the dialog itself. */
  readonly onPointerDown: PointerEventHandler<HTMLDialogElement>;
  /** Records whether the release landed there too. */
  readonly onPointerUp: PointerEventHandler<HTMLDialogElement>;
  /** Closes the dialog when the press and the release both landed on it. */
  readonly onClick: MouseEventHandler<HTMLDialogElement>;
};
