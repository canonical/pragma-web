import type { ComponentType, ReactElement } from "react";
import Context from "./common/Panel/Context.js";
import { useDropdownTrigger } from "./hooks/index.js";
import type {
  WithDropdownPanelTriggerProps,
  WithDropdownRender,
  WithDropdownTriggerProps,
} from "./types.js";

/**
 * Wires a trigger to a DropdownPanel, with no chevron: for a trigger the
 * design draws without one, such as an icon button that opens a settings or
 * options menu. It is `withDropdownButton` without the chevron and its
 * class, and shares its contract.
 *
 * It draws no button of its own. It takes the trigger component and a
 * render function that returns the complete `<DropdownPanel>`. The component
 * it returns renders the two as siblings, with no root element. The trigger
 * opens and closes the panel through `popovertarget`, so it works before any
 * script runs.
 *
 * The render function receives `{ close, ref, id, triggerId }`. **It must
 * set `ref` and `id` on the `<DropdownPanel>` it returns.** `DropdownPanel`
 * requires both, so a factory that forgets either fails to compile. Name the
 * panel with `aria-labelledby={triggerId}`, or with an `aria-label`.
 *
 * Every prop reaches the trigger unchanged, except the keys the HOC owns:
 * `popoverTarget`, `popoverTargetAction`, `aria-haspopup`, `aria-expanded`
 * and `aria-controls`. The trigger's `onClick` runs as its own, and
 * `event.preventDefault()` there cancels the toggle. The trigger renders
 * `type="button"` unless a `type` is passed; a `type="submit"` trigger also
 * submits the form around it.
 *
 * Call it once, at module scope. The render function can see only
 * module-level values, so data from the parent reaches the panel through a
 * context provided above the trigger.
 *
 * `import { withDropdownPanel } from "@canonical/react-ds-global";`
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
