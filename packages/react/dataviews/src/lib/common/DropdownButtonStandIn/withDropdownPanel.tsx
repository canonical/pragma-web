import type { ComponentType, ReactElement } from "react";
import Context from "./common/Panel/Context.js";
import { useDropdownTrigger } from "./hooks/index.js";
import type {
  WithDropdownPanelTriggerProps,
  WithDropdownRender,
  WithDropdownTriggerProps,
} from "./types.js";

/**
 * Wires a trigger to a DropdownPanel through `popovertarget`, so it opens with
 * no script, and draws no chevron.
 * Call it once at module scope; the render function must set `ref` and `id` on
 * the panel it returns.
 *
 * @param Trigger The trigger: it renders a `<button>` and forwards `id`, `type`, `style`, `popoverTarget` and the ARIA keys to it.
 * @param render A {@link WithDropdownRender} that returns the `<DropdownPanel>`, with `ref` and `id` set from its props.
 * @returns A component that renders the trigger and the panel as siblings.
 */
export default function withDropdownPanel<
  TProps extends WithDropdownPanelTriggerProps,
>(
  Trigger: ComponentType<TProps>,
  render: WithDropdownRender,
): ComponentType<WithDropdownTriggerProps<TProps>> {
  const WrappedComponent = (
    props: WithDropdownTriggerProps<TProps>,
  ): ReactElement => {
    const triggerOwnProps = props as TProps;
    const { triggerProps, renderProps, contextValue } = useDropdownTrigger({
      id: triggerOwnProps.id,
      style: triggerOwnProps.style,
      onKeyDown: triggerOwnProps.onKeyDown,
    });

    return (
      <>
        <Trigger
          {...triggerOwnProps}
          // After the spread, so a forwarded `type={undefined}` still renders
          // a plain button rather than a submit button.
          type={triggerOwnProps.type ?? "button"}
          {...triggerProps}
        />
        <Context.Provider value={contextValue}>
          {render(renderProps)}
        </Context.Provider>
      </>
    );
  };

  WrappedComponent.displayName = `withDropdownPanel(${
    Trigger.displayName || Trigger.name || "AnonymousComponent"
  })`;

  return WrappedComponent;
}
