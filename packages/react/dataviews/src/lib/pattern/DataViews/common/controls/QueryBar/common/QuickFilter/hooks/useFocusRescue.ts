import { useEffect, useLayoutEffect, useRef } from "react";
import type { UseFocusRescueProps, UseFocusRescueResult } from "./types.js";

/** What Tab reaches among a panel's controls, in document order. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
].join(", ");

/** The controls focus can rest on, in order. */
const listFocusable = (container: HTMLElement): HTMLElement[] => [
  ...container.querySelectorAll<HTMLElement>(FOCUSABLE),
];

/**
 * Keep focus in a panel when the control holding it goes, as a commit can
 * remove a checkbox or a switch, or disable a checkbox: focus moves to the
 * control that now stands in its place, or else the one before it, or else
 * the panel itself, never to the page.
 *
 */
// @note Impure: reads and moves focus.
export default function useFocusRescue(
  ...[containerRef]: UseFocusRescueProps
): UseFocusRescueResult {
  // The control that last took focus, and its place among the controls.
  const held = useRef<{
    readonly element: HTMLElement;
    readonly place: number;
  } | null>(null);
  useEffect(() => {
    const container = containerRef.current;
    /* v8 ignore next -- unreachable: the container renders before its effects run */
    if (container === null) return;
    const handleFocusIn = (event: FocusEvent): void => {
      const element = event.target as HTMLElement;
      held.current = {
        element,
        place: listFocusable(container).indexOf(element),
      };
    };
    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, [containerRef]);
  useLayoutEffect(() => {
    const container = containerRef.current;
    const last = held.current;
    if (container === null || last === null) return;
    const { element, place } = last;
    if (element.isConnected && !element.matches(":disabled")) return;
    held.current = null;
    const active = container.ownerDocument.activeElement;
    // Focus that went somewhere of its own accord is left there.
    if (
      active !== null &&
      active !== element &&
      active !== container.ownerDocument.body
    ) {
      return;
    }
    const controls = listFocusable(container);
    const next =
      controls.at(place) ??
      controls.at(place - 1) ??
      container.closest<HTMLElement>(".ds.filter-button-panel");
    next?.focus();
  });
}
