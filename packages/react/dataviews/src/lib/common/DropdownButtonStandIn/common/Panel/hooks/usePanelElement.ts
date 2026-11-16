import type { ToggleEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UsePanelElementProps, UsePanelElementResult } from "./types.js";

/** What Tab reaches inside the panel, in document order. */
const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(", ");

/**
 * Reads the focused element of the tree `node` sits in: a document, or a
 * shadow root, where the document only sees the host.
 *
 * @param node Any node in the tree.
 * @returns The focused element of that tree, if any.
 */
function findActiveElement(node: Node): Element | null {
  return (node.getRootNode() as Document | ShadowRoot).activeElement;
}

/**
 * Moves focus to the panel's first focusable control, or to the panel when it
 * has none.
 *
 * @param panel The open panel.
 * @note Impure: moves focus.
 */
function focusFirstControl(panel: HTMLElement): void {
  for (const control of panel.querySelectorAll<HTMLElement>(TABBABLE)) {
    if (control.closest("[hidden], [inert]")) continue;
    control.focus();
    if (findActiveElement(panel) === control) return;
  }
  panel.focus();
}

/**
 * Keeps a panel's state in step with its popover element, and moves focus into
 * the panel and back to its trigger.
 *
 * @param elementRef The panel's element ref, which the handle also reads.
 * @param panel The panel state this element reports to.
 * @param onToggle The consumer's toggle listener, which runs first.
 * @param onBeforeToggle The consumer's beforetoggle listener, which runs first.
 * @returns The ref callback for the element and its two toggle listeners.
 */
export default function usePanelElement({
  elementRef,
  panel,
  onToggle,
  onBeforeToggle,
}: UsePanelElementProps): UsePanelElementResult {
  // The effects read the element from state, so they run again once it
  // exists; the ref, which React clears on unmount, serves the handle.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const attachElement = useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      setElement(node);
    },
    [elementRef],
  );
  const hadFocusRef = useRef(false);
  const { isOpen, setOpen, kind, setFocusIntent, triggerId } = panel;

  // A popover opened before hydration fired its toggle event before React
  // listened, so read its real state once the element mounts. A menu in it
  // then keeps focus where the user put it: on the same item, or outside.
  useEffect(() => {
    if (!element) return;
    const isOpenNow = element.matches(":popover-open");
    if (isOpenNow) {
      const items: (Element | null)[] = [
        ...element.querySelectorAll(".ds.dropdown-button-menu-item"),
      ];
      // activeElement is null only with no focus at all, which indexOf misses.
      const index = items.indexOf(findActiveElement(element));
      setFocusIntent(index >= 0 ? index : "none");
    }
    setOpen(isOpenNow);
  }, [element, setOpen, setFocusIntent]);

  // A page restored from the back-forward cache comes back as it was left.
  // While the panel is open, re-read its real state then, so the trigger
  // never announces a stale one. A closed panel adds no listener.
  // @note Impure: listens to the window's pageshow event.
  useEffect(() => {
    if (!element || !isOpen) return;
    const handlePageShow = (): void => {
      setOpen(element.matches(":popover-open"));
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [element, isOpen, setOpen]);

  // Safari does not focus a button on click, so the browser's own focus
  // return can land on <body>. Record whether focus was inside before the
  // panel closes, and return it to the trigger after.
  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    onBeforeToggle?.(event);
    // React passes a nested popover's toggle events up the tree; only this
    // panel's own concern it.
    if (event.target !== event.currentTarget) return;
    if (event.newState === "closed") {
      hadFocusRef.current = event.currentTarget.contains(
        findActiveElement(event.currentTarget),
      );
    }
  };

  // @note Impure: moves focus into the panel when it opens, and back to the
  // trigger when it closes with focus inside. A menu moves its own focus.
  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    onToggle?.(event);
    if (event.target !== event.currentTarget) return;
    const target = event.currentTarget;
    setOpen(event.newState === "open");
    if (event.newState === "open") {
      if (kind === "dialog") focusFirstControl(target);
      return;
    }
    setFocusIntent("first");
    if (hadFocusRef.current) {
      hadFocusRef.current = false;
      // The trigger sits in the same tree as the panel, a document or a
      // shadow root.
      const root = target.getRootNode() as Document | ShadowRoot;
      if (triggerId) root.getElementById(triggerId)?.focus();
    }
  };

  return { attachElement, handleBeforeToggle, handleToggle };
}
