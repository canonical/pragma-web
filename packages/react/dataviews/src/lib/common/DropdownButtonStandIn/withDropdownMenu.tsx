import type { ComponentType, ReactElement } from "react";
import { Menu } from "./common/Menu/index.js";
import { Panel } from "./common/Panel/index.js";
import { useDropdownTrigger } from "./hooks/index.js";
import type {
  WithDropdownMenuProps,
  WithDropdownMenuTriggerProps,
} from "./types.js";

/**
 * Wires a trigger to a menu of actions and links, with no chevron.
 * Call it once at module scope. The trigger opens the menu through
 * `popovertarget`, so a menu of links works with no script.
 *
 * @param Trigger The trigger: it renders a `<button>` and forwards `id`, `type`, `style`, `onKeyDown`, `popoverTarget` and the ARIA keys to it.
 * @returns A component that renders the trigger and its menu as siblings.
 */
export default function withDropdownMenu<
  TProps extends WithDropdownMenuTriggerProps,
>(
  Trigger: ComponentType<TProps>,
): ComponentType<WithDropdownMenuProps<TProps>> {
  const WrappedComponent = ({
    items,
    onSelect,
    label,
    labelledBy,
    ...props
  }: WithDropdownMenuProps<TProps>): ReactElement => {
    const triggerOwnProps = props as unknown as TProps;
    const { triggerProps, panel } = useDropdownTrigger({
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
        <Panel panel={panel}>
          <Menu
            items={items}
            onSelect={onSelect}
            label={label}
            labelledBy={labelledBy}
            panel={panel}
          />
        </Panel>
      </>
    );
  };

  WrappedComponent.displayName = `withDropdownMenu(${
    Trigger.displayName || Trigger.name || "AnonymousComponent"
  })`;

  return WrappedComponent;
}
