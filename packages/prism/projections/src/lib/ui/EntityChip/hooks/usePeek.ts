import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PEEK_CLOSE_DELAY_MS, PEEK_OPEN_DELAY_MS } from "../constants.js";
import type {
  PeekHandlers,
  ShowPopover,
  UsePeekProps,
  UsePeekResult,
} from "./types.js";

/**
 * Find a peeking chip's link: its root's child with an `href`, which a
 * chip that peeks always has, since only a linked chip peeks.
 *
 * @param root - The chip's root.
 * @returns The link.
 */
const findLink = (root: Element): HTMLElement =>
  root.querySelector(":scope > [href]") as HTMLElement;

/**
 * Open and close a chip's peek: after `PEEK_OPEN_DELAY_MS` of a mouse or
 * pen resting on the chip, at once when its link takes focus; open while
 * the pointer is over the chip or the peek, closed `PEEK_CLOSE_DELAY_MS`
 * after it has left both, when focus leaves both, and on Escape, which
 * returns focus to the link when focus was in the chip. A peek opened by
 * hover holds no focus, so its Escape is heard on the document while it
 * is open. A touch never opens it, so a tap follows the link. While open,
 * the peek is shown in the top layer as a manual popover, so no ancestor's
 * overflow clips it, from the chip's link as its source, so a browser that
 * takes a source puts the peek next after the link in the tab order.
 *
 * The handlers go on the chip's root. The peek is mounted on the
 * document's body, outside the root, but it is the root's child in the
 * React tree, so its pointer, focus and key events reach the root's
 * handlers; focus leaving the root for the peek, or the peek for the root,
 * is focus kept, so the test on blur takes both elements.
 *
 * @param props - Whether the chip can peek, and the consumer's handlers.
 * @returns Whether the peek is open, the refs of the root and the peek,
 *   and the handlers for the root.
 * @note Impure: runs timers, moves focus, shows the popover and listens
 *   for Escape on the document while the peek is open.
 */
export default function usePeek({
  enabled,
  handlers: own,
}: UsePeekProps): UsePeekResult {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touched = useRef(false);
  const returning = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    // A hover-opened peek: focus is elsewhere, so the root hears no key.
    // An Escape the chip or anything else already handled is left alone.
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      clearTimeout(timer.current);
      setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useLayoutEffect(() => {
    const peek = peekRef.current;
    // The popover API is the browser's: a document without it keeps the
    // peek in place, where it is still read and reached by focus.
    if (open && peek !== null && typeof peek.showPopover === "function") {
      // The peek mounts inside the root's tree, so the root is mounted.
      const source = findLink(rootRef.current as HTMLSpanElement);
      (peek.showPopover as ShowPopover).call(peek, { source });
    }
  }, [open]);

  const schedule = (next: boolean, delay: number): void => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };

  const settle = (next: boolean): void => {
    clearTimeout(timer.current);
    setOpen(next);
  };

  const peek: PeekHandlers = {
    onPointerDown: (event) => {
      touched.current = event.pointerType === "touch";
    },
    onPointerEnter: (event) => {
      if (event.pointerType === "touch") return;
      schedule(true, open ? 0 : PEEK_OPEN_DELAY_MS);
    },
    onPointerLeave: (event) => {
      if (event.pointerType === "touch") return;
      schedule(false, PEEK_CLOSE_DELAY_MS);
    },
    onFocus: () => {
      if (touched.current || returning.current) {
        returning.current = false;
        return;
      }
      settle(true);
    },
    onBlur: (event) => {
      const next = event.relatedTarget;
      const kept =
        next instanceof Node &&
        (event.currentTarget.contains(next) ||
          peekRef.current?.contains(next) === true);
      if (kept) return;
      touched.current = false;
      settle(false);
    },
    onKeyDown: (event) => {
      if (!open || event.key !== "Escape") return;
      event.preventDefault();
      settle(false);
      const link = findLink(event.currentTarget);
      if (link !== document.activeElement) {
        returning.current = true;
        link.focus();
      }
    },
  };

  // The consumer's handler runs first; the peek's only on a chip that peeks.
  const handlers: PeekHandlers = {
    onPointerDown: (event) => {
      own.onPointerDown?.(event);
      if (enabled) peek.onPointerDown(event);
    },
    onPointerEnter: (event) => {
      own.onPointerEnter?.(event);
      if (enabled) peek.onPointerEnter(event);
    },
    onPointerLeave: (event) => {
      own.onPointerLeave?.(event);
      if (enabled) peek.onPointerLeave(event);
    },
    onFocus: (event) => {
      own.onFocus?.(event);
      if (enabled) peek.onFocus(event);
    },
    onBlur: (event) => {
      own.onBlur?.(event);
      if (enabled) peek.onBlur(event);
    },
    onKeyDown: (event) => {
      own.onKeyDown?.(event);
      if (enabled) peek.onKeyDown(event);
    },
  };

  return { open, rootRef, peekRef, handlers };
}
