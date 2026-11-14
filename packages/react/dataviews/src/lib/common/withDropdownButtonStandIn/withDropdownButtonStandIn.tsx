import { Icon } from "@canonical/react-ds-global";
import type { ComponentType, ReactElement } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useIsHydrated } from "../../hooks/index.js";
import Context from "./Context.js";
import type {
  DropdownPanelHandle,
  WithDropdownButtonTriggerProps,
  WithDropdownRender,
  WithDropdownTriggerProps,
} from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button";

/**
 * A stand-in for `withDropdownButton` in panel mode. It takes the trigger
 * component and a render function that returns the `<DropdownPanel>`, and
 * renders the two as siblings. The trigger opens and closes the panel through
 * `popovertarget`, so it works before scripts run, and a chevron follows its
 * children. Once hydrated, the trigger advertises a dialog and its open state.
 * Call it once, at module scope.
 *
 * @param Trigger The trigger: it renders a `<button>` and forwards `id`, `type`, `popoverTarget` and the ARIA keys to it.
 * @param render A {@link WithDropdownRender} that returns the panel, with `ref` and `id` set from its props.
 * @returns A component that renders the trigger, with the chevron, and the panel as siblings.
 */
export default function withDropdownButtonStandIn<
  TProps extends WithDropdownButtonTriggerProps,
>(
  Trigger: ComponentType<TProps>,
  render: WithDropdownRender,
): ComponentType<WithDropdownTriggerProps<TProps>> {
  const WrappedComponent = (
    props: WithDropdownTriggerProps<TProps>,
  ): ReactElement => {
    const { id, className, children, ...triggerOwnProps } = props as TProps;
    const generatedId = useId();
    const panelId = useId();
    const triggerId = id ?? generatedId;
    const isMounted = useIsHydrated();
    const [isOpen, setOpen] = useState(false);
    const ref = useRef<DropdownPanelHandle>(null);
    const close = useCallback(() => ref.current?.hide(), []);
    // A root's identifierPrefix can put characters into the id that a CSS
    // ident cannot hold.
    const anchorName = `--${panelId.replace(/[^\w-]/g, "_")}`;
    const contextValue = useMemo(
      () => ({ setOpen, anchorName, triggerId }),
      [anchorName, triggerId],
    );
    const triggerProps = {
      ...triggerOwnProps,
      // A `type` passed as undefined still renders a plain button.
      type: triggerOwnProps.type ?? "button",
      id: triggerId,
      className: [componentCssClassName, className].filter(Boolean).join(" "),
      popoverTarget: panelId,
      // The anchor name is set last, so the panel is always placed by it.
      style: { ...triggerOwnProps.style, anchorName },
      "aria-haspopup": isMounted ? "dialog" : undefined,
      "aria-expanded": isMounted ? isOpen : undefined,
      "aria-controls": isMounted ? panelId : undefined,
      children: (
        <>
          {children}
          <span className="chevron">
            <Icon icon="chevron-down" />
          </span>
        </>
      ),
    } as TProps;

    return (
      <>
        <Trigger {...triggerProps} />
        <Context.Provider value={contextValue}>
          {render({ close, ref, id: panelId, triggerId })}
        </Context.Provider>
      </>
    );
  };

  WrappedComponent.displayName = `withDropdownButtonStandIn(${
    Trigger.displayName || Trigger.name || "AnonymousComponent"
  })`;

  return WrappedComponent;
}
