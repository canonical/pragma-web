import type {
  MenuItemPropsResult,
  ItemProps as NavigationItemProps,
} from "@canonical/react-hooks";
import type { MouseEvent } from "react";
import type { MenuItem } from "../../types.js";

/** The item's props. No single native root: an `<a>` or a `<div>`. */
export type ItemProps = {
  /** The menu item to render. */
  item: MenuItem;
  /** The navigation's ARIA and roving props, while the menu is open. */
  itemProps?: Partial<NavigationItemProps & MenuItemPropsResult>;
  /** Called when an enabled leaf is chosen, or a parent is opened. */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
};
