import type { ReactElement, ToggleEvent } from "react";
import { useContext, useEffect, useImperativeHandle, useRef } from "react";
import { useIsHydrated } from "../../hooks/index.js";
import Context from "./Context.js";
import type { DropdownPanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-panel";

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
    if (document.activeElement === control) return;
  }
  panel.focus();
};

/**
 * A stand-in for DropdownPanel's panel mode: a native `popover="auto"` that
 * holds any content, takes a raised Surface layer and, once hydrated, is a
 * non-modal dialog named by its trigger. Opening it moves focus to its first
 * control. Its `ref` receives a {@link DropdownPanelHandle}, and `onToggle`
 * runs before its own listener.
 *
 * @note Impure: the handle drives the popover element, and opening moves focus.
 */
export default function DropdownPanelStandIn({
  ref,
  id,
  children,
  className,
  style,
  onToggle,
  onBeforeToggle,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: DropdownPanelProps): ReactElement {
  const trigger = useContext(Context);
  const isMounted = useIsHydrated();
  const elementRef = useRef<HTMLDivElement>(null);
  const hadFocusRef = useRef(false);

  // A popover opened before hydration fired its toggle before React
  // listened, so its state is read once it mounts.
  // @note Impure: reads the popover element.
  useEffect(() => {
    const popover = elementRef.current;
    if (popover && trigger) trigger.setOpen(popover.matches(":popover-open"));
  }, [trigger]);

  useImperativeHandle(
    ref,
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
    onBeforeToggle?.(event);
    if (event.target !== event.currentTarget) return;
    if (event.newState === "closed") {
      hadFocusRef.current = event.currentTarget.contains(
        document.activeElement,
      );
    }
  };

  // @note Impure: moves focus in on opening, and back to the trigger.
  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    onToggle?.(event);
    // A popover nested in the panel reports its own toggles.
    if (event.target !== event.currentTarget) return;
    const isOpen = event.newState === "open";
    trigger?.setOpen(isOpen);
    if (isOpen) {
      focusFirstControl(event.currentTarget);
      return;
    }
    if (hadFocusRef.current) {
      hadFocusRef.current = false;
      if (trigger) document.getElementById(trigger.triggerId)?.focus();
    }
  };

  const dialogProps = isMounted
    ? {
        role: "dialog",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
      }
    : {};

  return (
    <div
      {...props}
      ref={elementRef}
      id={id}
      popover="auto"
      tabIndex={-1}
      className={[
        componentCssClassName,
        "surface",
        trigger && "anchored",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={trigger ? { ...style, positionAnchor: trigger.anchorName } : style}
      {...dialogProps}
      onBeforeToggle={handleBeforeToggle}
      onToggle={handleToggle}
    >
      {children}
    </div>
  );
}
