import { useCallback, useMemo, useState } from "react";
import type {
  PanelFocusIntent,
  UsePanelStateProps,
  UsePanelStateResult,
} from "./types.js";

/**
 * Holds the state a trigger and its panel share, keeping one identity until a
 * part of it changes.
 *
 * @param panelId The popover's id.
 * @param triggerId The trigger's id, when there is a trigger.
 * @param anchorName The trigger's CSS anchor name, when there is a trigger.
 * @param hide Closes the panel through its element.
 * @returns The shared panel state.
 */
export default function usePanelState({
  panelId,
  triggerId,
  anchorName,
  hide,
}: UsePanelStateProps): UsePanelStateResult {
  const [isOpen, setOpen] = useState(false);
  const [menuCount, setMenuCount] = useState(0);
  const [focusIntent, setFocusIntent] = useState<PanelFocusIntent>("first");

  const registerMenu = useCallback(() => {
    setMenuCount((count) => count + 1);
    return () => setMenuCount((count) => count - 1);
  }, []);

  const kind = menuCount > 0 ? "menu" : "dialog";

  return useMemo(
    () => ({
      panelId,
      triggerId,
      anchorName,
      isOpen,
      setOpen,
      kind,
      registerMenu,
      focusIntent,
      setFocusIntent,
      hide,
    }),
    [
      panelId,
      triggerId,
      anchorName,
      isOpen,
      kind,
      registerMenu,
      focusIntent,
      hide,
    ],
  );
}
