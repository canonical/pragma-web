import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PEEK_CLOSE_DELAY_MS, PEEK_OPEN_DELAY_MS } from "../constants.js";
import type { PeekHandlers, UsePeekProps, UsePeekResult } from "./types.js";

/**
 * Open and close a chip's peek: after `PEEK_OPEN_DELAY_MS` of a mouse or
 * pen resting on the chip, at once when its link takes focus; open while
 * the pointer is over the chip or the peek, closed `PEEK_CLOSE_DELAY_MS`
 * after it has left both, when focus leaves both, and on Escape, which
 * returns focus to the link. A touch never opens it, so a tap follows the
 * link. While open, the peek is shown in the top layer as a manual popover,
 * so no ancestor's overflow clips it.
 *
 * The handlers go on the chip's root, which holds the link and the peek:
 * the peek is the root's descendant in the document even in the top layer,
 * so moving from one to the other neither leaves the root nor blurs it.
 *
 * @param props - Whether the chip can peek, and the consumer's handlers.
 * @returns Whether the peek is open, the refs of the root and the peek,
 *   and the handlers for the root.
 * @note Impure: runs timers, moves focus and shows the popover.
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

  useLayoutEffect(() => {
    const peek = peekRef.current;
    // The popover API is the browser's: a document without it keeps the
    // peek in place, where it is still read and reached by focus.
    if (open && peek !== null && typeof peek.showPopover === "function") {
      peek.showPopover();
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
      if (next instanceof Node && rootRef.current?.contains(next)) return;
      touched.current = false;
      settle(false);
    },
    onKeyDown: (event) => {
      if (!open || event.key !== "Escape") return;
      event.preventDefault();
      settle(false);
      const link =
        rootRef.current?.querySelector<HTMLElement>(":scope > [href]");
      if (
        link !== undefined &&
        link !== null &&
        link !== document.activeElement
      ) {
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
