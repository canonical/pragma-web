import type React from "react";
import { useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { useIsMounted } from "../hooks/index.js";
import { Menu } from "../Menu/index.js";
import Context from "./Context.js";
import {
  usePanelContext,
  usePanelElement,
  usePanelState,
} from "./hooks/index.js";
import type { DropdownPanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-panel";

/**
 * The native popover a DropdownButton reveals, holding any content or a
 * `<DropdownPanel.Menu>`.
 * Its `ref` gets a DropdownPanelHandle; it opens with no script and closes on
 * Escape, an outside click or its trigger.
 */
export default function Provider({
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
}: DropdownPanelProps): React.ReactElement {
  const elementRef = useRef<HTMLDivElement>(null);
  // @note Impure: closes the popover element.
  const hidePanel = useCallback(() => {
    const popover = elementRef.current;
    if (popover?.matches(":popover-open")) popover.hidePopover();
  }, []);
  const outer = usePanelContext();
  const own = usePanelState({ panelId: id, hide: hidePanel });
  // Only the state of this panel's own trigger: a panel composed inside
  // another panel's content keeps its own.
  const panel = outer?.panelId === id ? outer : own;
  const isMounted = useIsMounted();
  const { attachElement, handleBeforeToggle, handleToggle } = usePanelElement({
    elementRef,
    panel,
    onToggle,
    onBeforeToggle,
  });

  // @note Impure: each verb drives the popover element.
  useImperativeHandle(
    ref,
    () => ({
      show: () => {
        const popover = elementRef.current;
        if (popover && !popover.matches(":popover-open")) popover.showPopover();
      },
      hide: hidePanel,
      toggle: () => {
        elementRef.current?.togglePopover();
      },
      get element() {
        return elementRef.current;
      },
    }),
    [hidePanel],
  );

  const { kind } = panel;

  // A menu inside takes the panel's name, so the value the panel passes down
  // carries it.
  const value = useMemo(
    () => ({ ...panel, label: ariaLabel, labelledBy: ariaLabelledBy }),
    [panel, ariaLabel, ariaLabelledBy],
  );

  // A role-less element is never named, and the dialog role promises a focus
  // move only script provides, so the role and the name wait for hydration.
  // A panel that holds a menu takes neither: the menu carries both.
  const dialogProps =
    isMounted && kind === "dialog"
      ? {
          role: "dialog",
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledBy,
        }
      : {};

  return (
    <Context.Provider value={value}>
      <div
        {...props}
        ref={attachElement}
        id={id}
        popover="auto"
        tabIndex={-1}
        className={[
          componentCssClassName,
          "surface",
          panel.anchorName && "anchored",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          panel.anchorName
            ? { ...style, positionAnchor: panel.anchorName }
            : style
        }
        {...dialogProps}
        onBeforeToggle={handleBeforeToggle}
        onToggle={handleToggle}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

Provider.displayName = "DropdownPanel";
Provider.Menu = Menu;
