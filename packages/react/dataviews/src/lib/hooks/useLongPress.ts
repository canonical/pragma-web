import type { MouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { LONG_PRESS_MS, LONG_PRESS_SLOP_PX } from "./constants.js";
import type { UseLongPressProps, UseLongPressResult } from "./types.js";

/** Where a press began, and the timer that will call it long. */
type Press = {
  readonly x: number;
  readonly y: number;
  readonly timer: ReturnType<typeof setTimeout>;
};

/**
 * Tell a long press on touch apart from a tap, and both from a scroll.
 *
 * A touch held still for the delay is a long press; one released before it
 * is a tap, and one that drifts past the slop is a scroll and neither. The
 * handlers go on the pressed element. The click a released long press still
 * produces is swallowed, so a long press is never also a tap, and the context
 * menu a platform opens for a held touch is suppressed while a press is
 * tracked, so the platform's gesture does not fight this one. A mouse or pen
 * is never a long press: its clicks are taps, and its context menu is left
 * alone.
 */
export default function useLongPress({
  onLongPress,
  onTap,
}: UseLongPressProps): UseLongPressResult {
  const press = useRef<Press | null>(null);
  // Set when the timer fires, read and cleared by the click that follows.
  const fired = useRef(false);
  const latest = useRef({ onLongPress, onTap });
  latest.current = { onLongPress, onTap };

  const cancel = useCallback((): void => {
    if (press.current !== null) {
      clearTimeout(press.current.timer);
      press.current = null;
    }
  }, []);
  // A press still tracked when the element goes is let go with it.
  useEffect(() => cancel, [cancel]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>): void => {
      if (event.pointerType !== "touch") {
        return;
      }
      cancel();
      fired.current = false;
      press.current = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
          press.current = null;
          fired.current = true;
          latest.current.onLongPress();
        }, LONG_PRESS_MS),
      };
    },
    [cancel],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>): void => {
      const began = press.current;
      if (
        began !== null &&
        Math.hypot(event.clientX - began.x, event.clientY - began.y) >
          LONG_PRESS_SLOP_PX
      ) {
        cancel();
      }
    },
    [cancel],
  );

  const onClick = useCallback((event: MouseEvent<HTMLElement>): void => {
    if (fired.current) {
      // The release of a long press: not a tap.
      fired.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    latest.current.onTap(event);
  }, []);

  const onContextMenu = useCallback((event: MouseEvent<HTMLElement>): void => {
    if (press.current !== null || fired.current) {
      event.preventDefault();
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onClick,
    onContextMenu,
  };
}
