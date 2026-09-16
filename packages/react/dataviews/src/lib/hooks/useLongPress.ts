import { useEffect, useInsertionEffect, useRef } from "react";
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
 * handlers go on the pressed element or on a container, and `claim` answers
 * what a press or a click landed on — a row, say — or null where it is not
 * the handler's. A press is claimed where it begins and again when it fires,
 * so a long press is handed only what is still there under it. The click a
 * released long press still produces is swallowed, so a long press is never
 * also a tap, and the context menu a platform opens for a held touch is
 * suppressed while a press is tracked, so the platform's gesture does not
 * fight this one. A mouse or pen is never a long press: its
 * clicks are taps, and its context menu is left alone.
 *
 * @note Impure: schedules the press timer, and cancels the click and the
 * context menu of a long press.
 */
export default function useLongPress<TClaim>({
  claim,
  onLongPress,
  onTap,
}: UseLongPressProps<TClaim>): UseLongPressResult {
  const press = useRef<Press | null>(null);
  // Set when the timer fires, read and cleared by the click that follows the
  // release — or, where the platform sends none, let go a tick after it, so
  // no later click of another kind is taken for the press's.
  const fired = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The latest handlers, taken once a render commits: the timer and the
  // click read them, never a render React discarded.
  const latest = useRef({ claim, onLongPress, onTap });
  useInsertionEffect(() => {
    latest.current = { claim, onLongPress, onTap };
  });

  const cancel = (): void => {
    if (press.current !== null) {
      clearTimeout(press.current.timer);
      press.current = null;
    }
  };
  // The release of a press: the compat click, where the platform sends one,
  // is dispatched before any timer runs, so a fired press still standing a
  // tick later had no click to swallow.
  const release = (): void => {
    cancel();
    if (fired.current && releaseTimer.current === null) {
      releaseTimer.current = setTimeout(() => {
        releaseTimer.current = null;
        fired.current = false;
      }, 0);
    }
  };
  // A press still tracked when the element goes — or its effects are torn
  // down and set up again, as a hidden Activity or StrictMode does — is let
  // go with it, and nothing it left behind outlives it: a fired press whose
  // release was pending is over, so no later click is taken for its own.
  useEffect(
    () => () => {
      if (press.current !== null) {
        clearTimeout(press.current.timer);
        press.current = null;
      }
      if (releaseTimer.current !== null) {
        clearTimeout(releaseTimer.current);
        releaseTimer.current = null;
      }
      fired.current = false;
    },
    [],
  );

  return {
    onPointerDown: (event) => {
      // Any new press, of any pointer, is not the release of the last one.
      fired.current = false;
      const { target, currentTarget: container } = event;
      if (
        event.pointerType !== "touch" ||
        latest.current.claim(target, container) === null
      ) {
        return;
      }
      cancel();
      press.current = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
          press.current = null;
          fired.current = true;
          // Claimed again: what the press began on may have gone under it.
          const claimed = latest.current.claim(target, container);
          if (claimed !== null) {
            latest.current.onLongPress(claimed);
          }
        }, LONG_PRESS_MS),
      };
    },
    onPointerMove: (event) => {
      const began = press.current;
      if (
        began !== null &&
        Math.hypot(event.clientX - began.x, event.clientY - began.y) >
          LONG_PRESS_SLOP_PX
      ) {
        cancel();
      }
    },
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: cancel,
    onClick: (event) => {
      if (fired.current) {
        // The release of a long press: not a tap.
        fired.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const { claim, onTap } = latest.current;
      if (onTap === undefined) {
        return;
      }
      const claimed = claim(event.target, event.currentTarget);
      if (claimed !== null) {
        onTap(claimed);
      }
    },
    onContextMenu: (event) => {
      if (press.current !== null || fired.current) {
        event.preventDefault();
      }
    },
  };
}
