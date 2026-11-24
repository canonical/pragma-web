import { assertInvariant } from "@canonical/dataviews-core/bindings";
import type { KeyboardEvent } from "react";
import { useId } from "react";
import { useIsMounted } from "../common/hooks/index.js";
import { usePanelState } from "../common/Panel/hooks/index.js";
import type {
  UseDropdownTriggerProps,
  UseDropdownTriggerResult,
} from "./types.js";

/**
 * Wires a trigger to its menu: the ids, the shared state and the trigger's
 * props.
 * ArrowDown and ArrowUp open the menu with focus on its first or last item.
 *
 * @param id The trigger's own id, used when given.
 * @param style The trigger's own style; the anchor name is applied last.
 * @param onKeyDown The trigger's own key handler; its `preventDefault()`
 * skips the HOC's.
 * @returns The trigger's props and the shared state.
 */
export default function useDropdownTrigger({
  id,
  style,
  onKeyDown,
}: UseDropdownTriggerProps): UseDropdownTriggerResult {
  const generatedId = useId();
  const panelId = useId();
  const triggerId = id ?? generatedId;
  // A root's identifierPrefix lands inside the id, and may hold characters a
  // CSS ident cannot, so they become underscores, the same on both sides.
  const anchorName = `--${panelId.replace(/[^\w-]/g, "_")}`;
  const panel = usePanelState({ panelId, triggerId, anchorName });
  const isMounted = useIsMounted();

  // @note Impure: opens the menu, or moves focus into it, from the arrows.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!panel.isOpen) {
      panel.setFocusIntent(event.key === "ArrowUp" ? "last" : "first");
      panel.show();
      return;
    }
    // Already open, with focus on the trigger: move it into the menu. An
    // open menu's popover is mounted.
    const popover = assertInvariant(
      panel.elementRef.current,
      "an open menu's popover is mounted",
    );
    const items = popover.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    const item =
      event.key === "ArrowUp" ? items.item(items.length - 1) : items.item(0);
    item?.focus();
  };

  return {
    triggerProps: {
      id: triggerId,
      popoverTarget: panelId,
      popoverTargetAction: undefined,
      style: { ...style, anchorName },
      "aria-haspopup": isMounted ? "menu" : undefined,
      "aria-expanded": isMounted ? panel.isOpen : undefined,
      "aria-controls": isMounted ? panelId : undefined,
      onKeyDown: handleKeyDown,
    },
    panel,
  };
}
