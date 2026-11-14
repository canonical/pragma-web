import { useCallback, useMemo, useState } from "react";
import type {
  PanelFocusIntent,
  UsePanelStateProps,
  UsePanelStateResult,
} from "./types.js";

/**
 * Holds the state one trigger and its panel share: the ids, the anchor name,
 * whether the panel is open, whether it holds a menu, and which item a menu
 * focuses when it opens. The value keeps its identity until one of them
 * changes, so it can feed a context directly.
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
