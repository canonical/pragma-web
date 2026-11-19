import type { _DistributiveOmit } from "@canonical/ds-types";
import type { ComponentProps, MouseEvent } from "react";
import type { MenuItem, MenuSeparator } from "../../../../hooks/index.js";

/** A menu item, with ContextualMenu's entry shape and no submenu. */
export type DropdownMenuItem = _DistributiveOmit<MenuItem, "items">;

/** One entry in a menu: an item or a separator. */
export type DropdownMenuEntry = DropdownMenuItem | MenuSeparator;

/** The menu's own props. */
type OwnProps = {
  /** Items and separators, in order. */
  items: DropdownMenuEntry[];
  /**
   * Called with the chosen item and the click that chose it, before the
   * panel closes. For an item with a `url`, `event.preventDefault()` leaves
   * the navigation to a client router.
   */
  onSelect?: (item: DropdownMenuItem, event: MouseEvent<HTMLElement>) => void;
};

/** Native `<div>` props. `role` is the menu's, and the items are its children. */
export type DropdownMenuProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "role" | "children">;
