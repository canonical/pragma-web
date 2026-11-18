import { useEffect, useLayoutEffect, useRef } from "react";
import { useRovingStop } from "../../../../common/Roving/index.js";
import type { StopClaimProps } from "./types.js";

/**
 * Makes the host's moves of the tab stop take no focus once focus has left
 * the field: for elsewhere on the page, or for the page itself, as a press
 * on its background does. It claims each such move, as an item taking focus
 * would. Focus lost because its element was removed is not a leave, so a
 * move after a chip's removal still takes focus.
 *
 * @param props - QueryInput's root, and the flag that marks the claim.
 * @returns Nothing: it renders no element.
 * @note Impure: listens to the root's focus, and reads the focused element.
 */
export default function StopClaim({
  rootRef,
  isClaimingRef,
}: StopClaimProps): null {
  const stop = useRovingStop();
  const hasLeft = useRef(false);

  // Native listeners hear focus leave before any React handler, so a host
  // that moves the stop on blur sees the leave.
  useEffect(() => {
    const root = rootRef.current;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget as Node | null;
      if (next) {
        hasLeft.current = !root.contains(next);
        return;
      }
      // Focus went to the page. Its element still being there a task later
      // tells a leave from a removal.
      const target = event.target as Element;
      clearTimeout(timer);
      timer = setTimeout(() => {
        hasLeft.current =
          target.isConnected && !root.contains(document.activeElement);
      });
    };
    const handleFocusIn = (): void => {
      clearTimeout(timer);
      hasLeft.current = false;
    };
    root.addEventListener("focusout", handleFocusOut);
    root.addEventListener("focusin", handleFocusIn);
    return () => {
      clearTimeout(timer);
      root.removeEventListener("focusout", handleFocusOut);
      root.removeEventListener("focusin", handleFocusIn);
    };
  }, [rootRef]);

  const previous = useRef(stop?.activeItem);
  // Before the items' effects, which move focus for a move not claimed.
  useLayoutEffect(() => {
    // Outside a roving composite there is no stop to claim.
    if (!stop || previous.current === stop.activeItem) return;
    previous.current = stop.activeItem;
    if (!hasLeft.current) return;
    isClaimingRef.current = true;
    try {
      stop.setActiveItem(stop.activeItem);
    } finally {
      isClaimingRef.current = false;
    }
  });

  return null;
}
