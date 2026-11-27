import { useLayoutEffect, useRef, useState } from "react";
import type { UsePanelFocusProps, UsePanelFocusResult } from "./types.js";

/**
 * Where the focus goes when a saved-views dialog closes or the focus is
 * stranded.
 *
 * A closing dialog returns the focus to the command that opened it, as the
 * platform does; while a command is pending, and that command with it, the
 * return waits for it to settle. A control that became unavailable or went
 * away under the focus hands it to the view select — or, while the views
 * are unavailable and the select with them, to Try again. Only focus that
 * was lost is taken back, never from another element the user moved it to.
 *
 * @note Impure: moves the focus in a layout effect.
 */
export default function usePanelFocus({
  pending,
}: UsePanelFocusProps): UsePanelFocusResult {
  const select = useRef<HTMLSelectElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  // What the focus was last on inside the control, until it leaves. A
  // control disabled or removed under the focus reports no blur, so this
  // finds the focus stranded.
  const focused = useRef<HTMLElement>(null);
  const retry = useRef<HTMLButtonElement>(null);
  // Where a closed dialog sends the focus: state, so closing always renders.
  const [returnTo, setReturnTo] = useState<HTMLElement | null>(null);

  // A layout effect, so the focus moves in the commit that stranded it,
  // never after a paint.
  useLayoutEffect(() => {
    if (pending) {
      return;
    }
    if (returnTo !== null) {
      // Taking the focus records it as focused; a target that cannot take
      // it leaves the focus stranded where it was.
      returnTo.focus();
      setReturnTo(null);
    }
    const stranded = focused.current;
    if (
      stranded !== null &&
      (!stranded.isConnected || stranded.matches(":disabled"))
    ) {
      focused.current = null;
      const { activeElement, body } = stranded.ownerDocument;
      const lost: readonly (Element | null)[] = [stranded, body, null];
      if (lost.includes(activeElement)) {
        (select.current?.disabled ? retry.current : select.current)?.focus();
      }
    }
  });

  return {
    select,
    retry,
    recordOpener(event) {
      opener.current = event.currentTarget;
    },
    restoreFocus(event) {
      const { activeElement, body } = event.currentTarget.ownerDocument;
      if (activeElement === null || activeElement === body) {
        setReturnTo(opener.current);
      }
    },
    recordFocus(event) {
      focused.current = event.target;
    },
    recordBlur(event) {
      // Focus leaving for nowhere may be its control going away.
      if (event.relatedTarget !== null) {
        focused.current = null;
      }
    },
  };
}
