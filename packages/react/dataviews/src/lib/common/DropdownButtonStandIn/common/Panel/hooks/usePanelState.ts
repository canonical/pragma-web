import { useCallback, useMemo, useRef, useState } from "react";
import type {
  PanelFocusIntent,
  UsePanelStateProps,
  UsePanelStateResult,
} from "./types.js";

/**
 * Holds the state a trigger and its menu's popover share, keeping one
 * identity until a part of it changes.
 *
 * @param panelId The popover's id.
 * @param triggerId The trigger's id.
 * @param anchorName The trigger's CSS anchor name.
 * @returns The shared state.
 */
export default function usePanelState({
  panelId,
  triggerId,
  anchorName,
}: UsePanelStateProps): UsePanelStateResult {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [focusIntent, setFocusIntent] = useState<PanelFocusIntent>("first");

  // @note Impure: opens the popover element.
  const show = useCallback(() => {
    const popover = elementRef.current;
    if (popover && !popover.matches(":popover-open")) popover.showPopover();
  }, []);

  // @note Impure: closes the popover element.
  const hide = useCallback(() => {
    const popover = elementRef.current;
    if (popover?.matches(":popover-open")) popover.hidePopover();
  }, []);

  return useMemo(
    () => ({
      panelId,
      triggerId,
      anchorName,
      elementRef,
      isOpen,
      setOpen,
      focusIntent,
      setFocusIntent,
      show,
      hide,
    }),
    [panelId, triggerId, anchorName, isOpen, focusIntent, show, hide],
  );
}
