import { useMemo, useState } from "react";
import type { UsePanelStateProps, UsePanelStateResult } from "./types.js";

/**
 * Holds the state one trigger and its panel share: the ids, the anchor name
 * and whether the panel is open. The value keeps its identity until one of
 * them changes, so it can feed a context directly.
 *
 * @param panelId The popover's id.
 * @param triggerId The trigger's id, when there is a trigger.
 * @param anchorName The trigger's CSS anchor name, when there is a trigger.
 * @returns The shared panel state.
 */
export default function usePanelState({
  panelId,
  triggerId,
  anchorName,
}: UsePanelStateProps): UsePanelStateResult {
  const [isOpen, setOpen] = useState(false);

  return useMemo(
    () => ({ panelId, triggerId, anchorName, isOpen, setOpen }),
    [panelId, triggerId, anchorName, isOpen],
  );
}
