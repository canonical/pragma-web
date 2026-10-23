import type { RefObject } from "react";

/** What `useOpenShortcut` takes: the palette's dialog. */
export type UseOpenShortcutProps = RefObject<HTMLDialogElement | null>;

/** What `useOpenShortcut` returns: nothing; it only listens. */
export type UseOpenShortcutResult = undefined;
