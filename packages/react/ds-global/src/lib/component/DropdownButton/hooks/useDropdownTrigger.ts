import { useCallback, useId, useRef } from "react";
import { useIsMounted } from "../../../hooks/index.js";
import { usePanelState } from "../common/Panel/hooks/index.js";
import type { DropdownPanelHandle } from "../common/Panel/index.js";
import type {
  UseDropdownTriggerProps,
  UseDropdownTriggerResult,
} from "./types.js";

/**
 * Wires a trigger to its panel: the ids, the shared state, the props the
 * trigger takes and the props the render function receives.
 *
 * The trigger names the panel with `popovertarget` and carries the CSS
 * anchor name, `--` and the panel's id, from the first render. The ARIA
 * that advertises the popup waits for hydration, because before it only the
 * native popover runs.
 *
 * @param id The trigger's own id, used when given.
 * @param style The trigger's own style; the anchor name is applied last.
 * @returns The trigger's props, the render props and the context value.
 */
export default function useDropdownTrigger({
  id,
  style,
}: UseDropdownTriggerProps): UseDropdownTriggerResult {
  const generatedId = useId();
  const panelId = useId();
  const triggerId = id ?? generatedId;
  // A root's identifierPrefix lands inside the id, and may hold characters a
  // CSS ident cannot, so they become underscores, the same on both sides.
  const anchorName = `--${panelId.replace(/[^\w-]/g, "_")}`;
  const contextValue = usePanelState({ panelId, triggerId, anchorName });
  const isMounted = useIsMounted();
  const ref = useRef<DropdownPanelHandle>(null);
  const close = useCallback(() => ref.current?.hide(), []);

  return {
    triggerProps: {
      id: triggerId,
      popoverTarget: panelId,
      popoverTargetAction: undefined,
      style: { ...style, anchorName },
      "aria-haspopup": isMounted ? "dialog" : undefined,
      "aria-expanded": isMounted ? contextValue.isOpen : undefined,
      "aria-controls": isMounted ? panelId : undefined,
    },
    renderProps: { close, ref, id: panelId, triggerId },
    contextValue,
  };
}
