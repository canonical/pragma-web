import type { KeyboardEvent } from "react";
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
 * that advertises the popup, a dialog or a menu, waits for hydration,
 * because before it only the native popover runs.
 *
 * When the panel holds a menu, ArrowDown and ArrowUp on the trigger open it
 * with focus on the first or the last item, as the menu button pattern
 * asks. Enter, Space and a click open it natively.
 *
 * @param id The trigger's own id, used when given.
 * @param style The trigger's own style; the anchor name is applied last.
 * @param onKeyDown The trigger's own key handler; its `preventDefault()`
 * skips the HOC's.
 * @returns The trigger's props, the render props and the context value.
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
  const ref = useRef<DropdownPanelHandle>(null);
  const close = useCallback(() => ref.current?.hide(), []);
  const contextValue = usePanelState({
    panelId,
    triggerId,
    anchorName,
    hide: close,
  });
  const isMounted = useIsMounted();
  const { kind, setFocusIntent } = contextValue;

  // @note Impure: opens the panel from the arrow keys.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || kind !== "menu") return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!contextValue.isOpen) {
      setFocusIntent(event.key === "ArrowUp" ? "last" : "first");
      ref.current?.show();
      return;
    }
    // Already open, with focus on the trigger: move it into the menu. The
    // panel shares the trigger's tree while it is open.
    const root = event.currentTarget.getRootNode() as Document | ShadowRoot;
    const panel = root.getElementById(panelId) as HTMLElement;
    const items = panel.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"])',
    );
    const item =
      event.key === "ArrowUp" ? items.item(items.length - 1) : items.item(0);
    if (item) item.focus();
  };

  return {
    triggerProps: {
      id: triggerId,
      popoverTarget: panelId,
      popoverTargetAction: undefined,
      style: { ...style, anchorName },
      "aria-haspopup": isMounted ? kind : undefined,
      "aria-expanded": isMounted ? contextValue.isOpen : undefined,
      "aria-controls": isMounted ? panelId : undefined,
      onKeyDown: handleKeyDown,
    },
    renderProps: { close, ref, id: panelId, triggerId },
    contextValue,
  };
}
