import { Icon } from "@canonical/react-ds-global";
import type React from "react";
import type { ContextMenuItem, ItemContentProps } from "./types.js";
import "./styles.css";

const componentCssClassName =
  "ds side-navigation-context-switcher-item-content";

/**
 * Draws a context entry, or the "create context" action.
 *
 * @implements ds:apps.subcomponent.side_navigation-context_switcher-item_content
 */
export default function ItemContent({
  item,
  className,
  ...props
}: ItemContentProps): React.ReactElement {
  const { description, badge, isCurrent, renderLabel } =
    item as ContextMenuItem;

  if (renderLabel != null) {
    return (
      <span
        {...props}
        className={[componentCssClassName, "create", className]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon icon="plus" />
        <span className="label">{renderLabel}</span>
      </span>
    );
  }

  return (
    <span
      {...props}
      className={[componentCssClassName, isCurrent && "current", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="name">{item.label}</span>
      {description ? <span className="description">{description}</span> : null}
      {badge ? <span className="badge">{badge}</span> : null}
    </span>
  );
}
