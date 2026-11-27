import type { ComponentType, ReactElement } from "react";
import { useId } from "react";
import { useIsMounted } from "../../hooks/index.js";
import ContextualMenu from "./ContextualMenu.js";
import type {
  WithContextualMenuOptions,
  WithContextualMenuProps,
  WithContextualMenuTriggerProps,
} from "./types.js";
import { formatIdent, isMenuLink } from "./utils/index.js";

const triggerCssClassName = "ds contextual-menu-trigger";

/**
 * Wraps a trigger component with a {@link ContextualMenu}, rendered as its
 * sibling. Call it once, at module scope.
 *
 * `import { withContextualMenu } from "@canonical/react-ds-global";`
 *
 * @param Trigger A component that renders a `<button>` and forwards `id`, `type`, `className`, `style`, `popoverTarget` and `aria-haspopup` to it.
 * @param options The menu's options, fixed at wrap time.
 * @returns A component taking the trigger's props and `items`, `onSelect`, `menuLabel` and `menuLabelledBy`.
 */
export default function withContextualMenu<
  TProps extends WithContextualMenuTriggerProps,
>(
  Trigger: ComponentType<TProps>,
  options: WithContextualMenuOptions = {},
): ComponentType<WithContextualMenuProps<TProps>> {
  const WrappedComponent = ({
    items,
    onSelect,
    menuLabel,
    menuLabelledBy,
    ...props
  }: WithContextualMenuProps<TProps>): ReactElement => {
    const triggerProps = props as unknown as TProps;
    const { id, type, className, style } = triggerProps;
    const menuId = formatIdent(useId());
    const isMounted = useIsMounted();

    return (
      <>
        <Trigger
          {...triggerProps}
          id={id ?? `${menuId}-trigger`}
          type={type ?? "button"}
          // A menu of actions alone does nothing before scripts run.
          className={[
            triggerCssClassName,
            !items.some(isMenuLink) && "script-only",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ ...style, anchorName: `--${menuId}` }}
          popoverTarget={menuId}
          aria-haspopup={isMounted ? "menu" : undefined}
        />
        <ContextualMenu
          id={menuId}
          items={items}
          onSelect={onSelect}
          label={menuLabel}
          labelledBy={menuLabelledBy}
          wrap={options.wrap}
        />
      </>
    );
  };

  WrappedComponent.displayName = `withContextualMenu(${
    Trigger.displayName || Trigger.name || "Component"
  })`;

  return WrappedComponent;
}
