import type { ReactElement, ToggleEvent } from "react";
import { useEffect, useImperativeHandle, useRef } from "react";
import { useIsHydrated } from "../../../../hooks/index.js";
import type { PanelProps } from "./types.js";

const componentCssClassName = "ds filter-button-panel";

/** What Tab reaches inside the panel, in document order. */
const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]",
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(", ");

/**
 * Moves focus to the first control in the panel that takes it, skipping
 * those inside a hidden or inert subtree and those the browser refuses. With
 * none, the panel takes focus.
 *
 * @note Impure: moves focus.
 */
const focusFirstControl = (panel: HTMLElement): void => {
  for (const control of panel.querySelectorAll<HTMLElement>(TABBABLE)) {
    if (control.closest("[hidden], [inert]")) continue;
    control.focus();
    if (panel.ownerDocument.activeElement === control) return;
  }
  panel.focus();
};

/**
 * FilterButton's panel: a native `popover="auto"` on a raised Surface layer,
 * tethered to the trigger and, once hydrated, a non-modal dialog named by
 * it. Opening it moves focus to its first control; closing it with focus
 * inside gives focus back to the trigger. The host's `handleRef` receives a
 * {@link FilterButtonPanelHandle}, and its `onToggle` runs before the panel's
 * own listener.
 *
 * @note Impure: the handle drives the popover element, and toggling moves focus.
 */
export default function Panel({
  id,
  triggerId,
  anchorName,
  onOpenChange,
  handleRef,
  onToggle,
  children,
}: PanelProps): ReactElement {
  const isHydrated = useIsHydrated();
  const elementRef = useRef<HTMLDivElement>(null);
  const hadFocusRef = useRef(false);

  // A popover opened before hydration fired its toggle before React
  // listened, so its state is read once it mounts. Focus stays where the
  // reader put it.
  // @note Impure: reads the popover element.
  useEffect(() => {
    onOpenChange(elementRef.current?.matches(":popover-open") === true);
  }, [onOpenChange]);

  useImperativeHandle(
    handleRef,
    () => ({
      show: () => {
        const popover = elementRef.current;
        if (popover && !popover.matches(":popover-open")) popover.showPopover();
      },
      hide: () => {
        const popover = elementRef.current;
        if (popover?.matches(":popover-open")) popover.hidePopover();
      },
      toggle: () => {
        elementRef.current?.togglePopover();
      },
      get element() {
        return elementRef.current;
      },
    }),
    [],
  );

  // Safari does not focus a button on click, so the browser's own focus
  // return can land on the page: whether focus was inside is recorded before
  // the panel closes, and it goes back to the trigger after.
  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    const panel = event.currentTarget;
    if (event.target !== panel || event.newState !== "closed") return;
    hadFocusRef.current = panel.contains(panel.ownerDocument.activeElement);
  };

  // @note Impure: moves focus in on opening, and back to the trigger.
  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    onToggle?.(event);
    const panel = event.currentTarget;
    // A popover nested in the panel reports its own toggles.
    if (event.target !== panel) return;
    const isOpen = event.newState === "open";
    onOpenChange(isOpen);
    if (isOpen) {
      focusFirstControl(panel);
      return;
    }
    if (hadFocusRef.current) {
      hadFocusRef.current = false;
      panel.ownerDocument.getElementById(triggerId)?.focus();
    }
  };

  const dialogProps = isHydrated
    ? { role: "dialog", "aria-labelledby": triggerId }
    : {};

  return (
    <div
      ref={elementRef}
      id={id}
      popover="auto"
      tabIndex={-1}
      // The panel sits one Surface layer above its host.
      className={`${componentCssClassName} surface`}
      style={{ positionAnchor: anchorName }}
      {...dialogProps}
      onBeforeToggle={handleBeforeToggle}
      onToggle={handleToggle}
    >
      {children}
    </div>
  );
}
