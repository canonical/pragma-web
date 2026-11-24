import type { ToggleEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PanelState, UsePanelElementResult } from "./types.js";

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
 * Keeps the shared state in step with the menu's popover element, and
 * returns focus to the trigger on closing.
 *
 * @param panel The shared state the element reports to.
 * @returns The ref callback for the element and its two toggle listeners.
 */
export default function usePanelElement(
  panel: PanelState,
): UsePanelElementResult {
  const { elementRef, isOpen, setOpen, setFocusIntent, triggerId } = panel;
  // The effects read the element from state, so they run again once it
  // exists; the ref, which React clears on unmount, serves the state.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const hadFocusRef = useRef(false);

  // A popover opened before hydration fired its toggle event before React
  // listened. The menu in it keeps focus where the user put it, on the same
  // item or outside. Focus is read as the element attaches, since the
  // re-render that follows may replace the focused item.
  const attachElement = useCallback(
    (node: HTMLDivElement | null) => {
      elementRef.current = node;
      setElement(node);
      if (!node?.matches(":popover-open")) return;
      const items: (Element | null)[] = [
        ...node.querySelectorAll(".ds.dropdown-button-menu-item"),
      ];
      // activeElement is null only with no focus at all, which indexOf misses.
      const index = items.indexOf(findActiveElement(node));
      setFocusIntent(index >= 0 ? index : "none");
    },
    [elementRef, setFocusIntent],
  );

  // Its real open state is read once the element mounts.
  useEffect(() => {
    if (!element) return;
    setOpen(element.matches(":popover-open"));
  }, [element, setOpen]);

  // A page restored from the back-forward cache comes back as it was left.
  // While the menu is open, re-read its real state then, so the trigger
  // never announces a stale one. A closed menu adds no listener.
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
  // menu closes, and return it to the trigger after.
  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    if (event.newState === "closed") {
      hadFocusRef.current = event.currentTarget.contains(
        findActiveElement(event.currentTarget),
      );
    }
  };

  // @note Impure: returns focus to the trigger when the menu closes with
  // focus inside. The menu moves its own focus when it opens.
  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    const target = event.currentTarget;
    setOpen(event.newState === "open");
    if (event.newState === "open") return;
    setFocusIntent("first");
    if (hadFocusRef.current) {
      hadFocusRef.current = false;
      // The trigger sits in the same tree as the popover, a document or a
      // shadow root.
      const root = target.getRootNode() as Document | ShadowRoot;
      root.getElementById(triggerId)?.focus();
    }
  };

  return { attachElement, handleBeforeToggle, handleToggle };
}
