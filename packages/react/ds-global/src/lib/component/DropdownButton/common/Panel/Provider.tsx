import type React from "react";
import { useImperativeHandle, useRef } from "react";
import { useIsMounted } from "../../../../hooks/index.js";
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
 * The surface a DropdownButton reveals: a native popover that holds any
 * content, such as a checkbox list in a form or a search field. Its trigger
 * names its `id` with `popovertarget`, so it opens and closes with no script.
 * It closes on Escape, a click outside, its trigger, or a control inside with
 * `popovertargetaction="hide"`. Nothing its content does closes it: a
 * checkbox that toggles, a field that changes or focus that moves away leaves
 * it open.
 *
 * It is drawn in the top layer, so no ancestor's overflow clips it and it
 * needs no z-index. Where the browser has CSS anchor positioning, it sits
 * under its trigger and flips to stay in view. Elsewhere it opens where the
 * browser places popovers. It takes a raised Surface layer.
 *
 * `ref` and `id` are required. The ref receives a
 * {@link DropdownPanelHandle}. There is no `open` prop: the open state lives
 * in the element. The native `onToggle` reports every opening and closing,
 * with `event.newState`. It runs before the panel's own listener, and both
 * always run. Name the panel with `aria-labelledby` (its trigger's id) or
 * `aria-label`.
 *
 * Once hydrated, it is a non-modal dialog. Opening it moves focus to its
 * first control, and closing it while focus is inside returns focus to its
 * trigger.
 *
 * `import { DropdownPanel } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.subcomponent.dropdown_button-panel
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
  const outer = usePanelContext();
  const own = usePanelState({ panelId: id });
  // Only the state of this panel's own trigger: a panel composed inside
  // another panel's content keeps its own.
  const panel = outer?.panelId === id ? outer : own;
  const isMounted = useIsMounted();
  const elementRef = useRef<HTMLDivElement>(null);
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

  // A role-less element is never named, and the dialog role promises a focus
  // move only script provides, so the role and the name wait for hydration.
  const dialogProps = isMounted
    ? {
        role: "dialog",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
      }
    : {};

  return (
    <Context.Provider value={panel}>
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
