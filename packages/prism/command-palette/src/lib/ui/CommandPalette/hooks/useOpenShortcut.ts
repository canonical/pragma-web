import { useEffect } from "react";
import { PALETTE_SHORTCUT_KEY } from "../constants.js";
import type { UseOpenShortcutProps, UseOpenShortcutResult } from "./types.js";

/**
 * The text the chord carries into the palette: the trimmed value of the
 * page's search field when the focus is in one, else nothing.
 */
const readCarriedText = (focused: Element | null): string =>
  focused instanceof HTMLInputElement && focused.type === "search"
    ? focused.value.trim()
    : "";

/**
 * Open the palette's dialog with Cmd+K or Ctrl+K, from anywhere on the page.
 * The listener is ephemeral: attached to the document on mount, detached on
 * unmount, with no state of its own; whether the palette is open lives in
 * the dialog.
 *
 * The chord opens the dialog only when every guard passes, in this order:
 * the key is neither mid-IME-composition nor an auto-repeat (a held chord
 * opens once); neither Alt nor Shift is held, so those chords stay the
 * browser's; Cmd or Ctrl is held; the key is K; and the dialog is mounted.
 * The browser's own Ctrl+K is then prevented, and a closed dialog is
 * opened: `onOpen` is called with the trimmed text of the page's search
 * field when the focus is in one (the chord carries it into the palette),
 * else with nothing, then `showModal()`. An open dialog is left
 * as it is, since `showModal()` throws on one. The chord carries a
 * modifier, so it is no character-key shortcut and needs no switch to turn
 * it off (WCAG 2.1.4).
 *
 * @param props - The palette's dialog, and what to do as it opens.
 * @note Impure: attaches a `keydown` listener to `document` while mounted,
 *   and opens the dialog when the chord fires.
 */
export default function useOpenShortcut({
  dialog,
  onOpen,
}: UseOpenShortcutProps): UseOpenShortcutResult {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.isComposing || event.repeat) return;
      if (event.altKey || event.shiftKey) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== PALETTE_SHORTCUT_KEY) return;
      const element = dialog.current;
      if (element === null) return;
      event.preventDefault();
      if (element.open) return;
      onOpen(readCarriedText(document.activeElement));
      element.showModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialog, onOpen]);
}
