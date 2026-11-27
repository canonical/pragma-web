import type { _Item } from "@canonical/ds-types";
import type {
  ItemProps,
  MenuItemPropsResult,
  MenuProps,
  MenuPropsResult,
  NodeStatus,
} from "@canonical/react-hooks";
import type { MouseEvent, Ref } from "react";
import type { MenuEntry, MenuItem } from "../types.js";

/** What a menu container's props take: its name, and a ref to compose. */
type MenuContainerOptions = {
  /** The accessible name. */
  label?: string;
  /** The ids of the elements that name it. */
  labelledBy?: string;
  /** A ref composed with the navigation's own. */
  ref?: Ref<HTMLElement>;
};

/**
 * A menu item as the navigation tree holds it. A disabled item keeps its
 * flag as `unavailable`, which the tree does not read, so the arrows still
 * reach it.
 */
export type NavigationItem = MenuItem & {
  /** Disabled: it takes focus but cannot be chosen. */
  unavailable?: true;
};

/** The navigation every level of an open menu shares. */
export type MenuContextValue = {
  /** Props for a `role="menuitem"` element. */
  getItemProps: (item: _Item<MenuItem>) => ItemProps & MenuItemPropsResult;
  /** Props for a `role="menu"` container. */
  getMenuProps: (options: MenuContainerOptions) => MenuProps & MenuPropsResult;
  /** Where a node stands in the highlight. */
  getNodeStatus: (item: _Item<MenuEntry>) => NodeStatus;
  /** Moves the highlight, and so focus, to an item. */
  highlightItem: (item: _Item<MenuEntry>) => void;
  /** Chooses an item: calls `onSelect`, then closes the menu. */
  chooseItem: (item: MenuItem, event: MouseEvent<HTMLElement>) => void;
};
