import type { _DistributiveOmit, Item } from "@canonical/ds-types";
import type {
  ComponentProps,
  ComponentType,
  MouseEvent,
  ReactNode,
} from "react";

/**
 * A menu item: the base navigation fields, plus an optional icon, a
 * right-aligned slot (a badge or a shortcut) and a submenu.
 */
export type MenuItem = _DistributiveOmit<Item, "items"> & {
  /** Content rendered right-aligned within the item, such as a badge or shortcut. */
  slot?: ReactNode;
  /** Icon rendered left of the label. */
  icon?: ReactNode;
  /** Child entries: this item's submenu, which may itself contain separators. */
  items?: MenuEntry[];
  /** CSS class name applied to this item, in addition to the base classes. */
  className?: string;
  /**
   * Opts this item into rendering via `Component` instead of the default
   * layout. `"custom"` without a `Component` falls back to the default.
   */
  displayItemsType?: "default" | "custom";
  /** Custom component for rendering this item itself, when `displayItemsType` is `"custom"`. */
  Component?: ComponentType<{ item: MenuItem }>;
};

/** A non-interactive divider between menu entries, drawn as a rule. */
export interface MenuSeparator {
  /** Discriminant distinguishing a separator from a menu item. */
  type: "separator";
  /** Unique identity within the menu: the React key and the navigation id. */
  key: string;
}

/** One entry in a contextual menu's list: an actionable item or a separator. */
export type MenuEntry = MenuItem | MenuSeparator;

type OwnProps = {
  /**
   * The popover's id, a CSS ident: a trigger opens the menu with
   * `popovertarget={id}` and anchors it with `anchor-name: --{id}`.
   * Generated when absent.
   */
  id?: string;
  /**
   * The menu entries: one flat list of items and separators
   * (`{ type: "separator", key }`). An item with a `url` is a link. An item's
   * own `items` form its submenu, which may itself contain separators.
   */
  items: MenuEntry[];
  /**
   * Called with the chosen item and the click that chose it, before the menu
   * closes. For an item with a `url`, `event.preventDefault()` leaves the
   * navigation to a client router.
   */
  onSelect?: (item: MenuItem, event: MouseEvent<HTMLElement>) => void;
  /** The menu's accessible name. Falls back to labelling by the trigger. */
  label?: string;
  /**
   * The ids of the elements that name the menu; wins over `label`. Give it
   * when the trigger is named by `aria-labelledby`.
   */
  labelledBy?: string;
  /** Whether the arrow keys wrap at the first and last item. Defaults to true. */
  wrap?: boolean;
};

/**
 * The menu's props. Its root is the popover `<div>`; the menu owns
 * `popover`, `tabIndex`, its content and its `ref`.
 */
export type ContextualMenuProps = OwnProps &
  Omit<
    ComponentProps<"div">,
    keyof OwnProps | "children" | "popover" | "ref" | "tabIndex"
  >;

/** The menu's options, fixed when {@link withContextualMenu} wraps a trigger. */
export type WithContextualMenuOptions = Pick<ContextualMenuProps, "wrap">;

/** The menu's props that the wrapped trigger takes at render time. */
type WithContextualMenuMenuProps = Pick<
  ContextualMenuProps,
  "items" | "onSelect"
> & {
  /** The menu's accessible name. Falls back to labelling by the trigger. */
  menuLabel?: string;
  /**
   * The ids of the elements that name the menu; wins over `menuLabel`. Give
   * it when the trigger is named by `aria-labelledby`.
   */
  menuLabelledBy?: string;
};

/** Trigger keys the menu controls; the caller may not pass them. */
type ContextualMenuOwnedProps = Pick<
  ComponentProps<"button">,
  | "popoverTarget"
  | "popoverTargetAction"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls"
>;

/** The props a trigger must take: those {@link withContextualMenu} sets, and the menu keys it controls. */
export type WithContextualMenuTriggerProps = ContextualMenuOwnedProps &
  Pick<ComponentProps<"button">, "id" | "type" | "className" | "style">;

/**
 * The props of the component {@link withContextualMenu} returns: the
 * trigger's own, less the keys the menu owns, plus the menu's. The omission
 * distributes over unions, so a trigger's union of required names survives.
 */
export type WithContextualMenuProps<TProps> = _DistributiveOmit<
  TProps,
  keyof ContextualMenuOwnedProps | keyof WithContextualMenuMenuProps
> &
  WithContextualMenuMenuProps;
