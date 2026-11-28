// Ported from @canonical/react-ds-app SideNavigation useCollapseShortcut

import type {
  UseCollapseShortcutProps,
  UseCollapseShortcutResult,
} from "./types.js";

/**
 * The rail-collapse shortcut: Ctrl+B. A single module-level constant so
 * the key can change in one place if a consumer needs a different
 * binding.
 */
const COLLAPSE_SHORTCUT = { key: "b", ctrlKey: true } as const;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
    ) !== null
  );
};

/**
 * Binds `COLLAPSE_SHORTCUT` to `ontrigger` while `condition` holds.
 * `SideNavigation` calls this with its `keyboardShortcut` prop
 * (default `true`).
 *
 * The match is exact: the Ctrl+B chord with no other modifiers held, and
 * only when the event's target is not an editable element (an input,
 * textarea, select, or contenteditable host) — Ctrl+B is bold in editors,
 * and the shortcut must never steal it.
 *
 * Pass `condition` as a getter so the listener follows a changing prop.
 * @note Impure: creates an effect; call during component initialisation.
 */
export default function useCollapseShortcut(
  props: UseCollapseShortcutProps,
): UseCollapseShortcutResult {
  // Attaches the keydown listener to the window while `condition` holds and
  // removes it when the condition turns false or the component unmounts.
  // An effect because the listener is a client-only side effect: the server
  // has no window.
  $effect(() => {
    if (!props.condition) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.ctrlKey === COLLAPSE_SHORTCUT.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey &&
        event.key.toLowerCase() === COLLAPSE_SHORTCUT.key &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        props.ontrigger();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
}
