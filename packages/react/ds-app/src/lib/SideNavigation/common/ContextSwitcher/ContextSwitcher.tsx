import type { MenuEntry, MenuItem } from "@canonical/react-ds-global";
import { withContextualMenu } from "@canonical/react-ds-global";
import type React from "react";
import { GroupHeader } from "../GroupHeader/index.js";
import { type ContextMenuItem, Field, ItemContent } from "./common/index.js";
import type { ContextSwitcherProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation-context-switcher";

/** The dropdown field and the menu it opens. */
const FieldMenu = withContextualMenu(Field);

/**
 * The context switcher allows users to switch between different contexts,
 * such as projects or users, within an application. The context switcher is
 * a dropdown that includes the currently selected context, a list of
 * available contexts, and an optional action to create a new context.
 *
 * @implements ds:apps.subcomponent.side-navigation-context-switcher
 */
export default function ContextSwitcher({
  title,
  currentContext,
  contexts,
  onContextChange,
  onCreateContext,
  createContextLabel = "Create context",
  className,
  ...props
}: ContextSwitcherProps): React.ReactElement {
  const contextItems: ContextMenuItem[] = contexts.map((context) => ({
    context,
    key: context.key,
    label: context.name,
    description: context.description,
    badge: context.badge,
    isCurrent: context.key === currentContext.key,
    displayItemsType: "custom",
    Component: ItemContent,
  }));

  const items: MenuEntry[] = contextItems;

  if (onCreateContext) {
    const createContextItem: ContextMenuItem = {
      key: "create-context",
      // A plain string for type-ahead; `renderLabel` is what shows.
      label:
        typeof createContextLabel === "string"
          ? createContextLabel
          : "Create context",
      renderLabel: createContextLabel,
      displayItemsType: "custom",
      Component: ItemContent,
    };
    items.push({ type: "separator", key: "create-context-separator" });
    items.push(createContextItem);
  }

  // Every entry but "create context" carries its context.
  const handleSelect = (item: MenuItem) => {
    const { context } = item as ContextMenuItem;
    if (context) onContextChange?.(context);
    else onCreateContext?.();
  };

  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      {...props}
    >
      {title != null && <GroupHeader>{title}</GroupHeader>}
      <FieldMenu items={items} onSelect={handleSelect}>
        {currentContext.name}
      </FieldMenu>
    </div>
  );
}
