import type { MenuItem, MenuSeparator } from "@canonical/react-ds-global";
import type { DropdownMenuProps } from "../../types.js";
import type { PanelState } from "../Panel/hooks/types.js";
import type { DistributiveOmit } from "../utils/types.js";

/** A menu item, with ContextualMenu's entry shape and no submenu. */
export type DropdownMenuItem = DistributiveOmit<MenuItem, "items">;

/** One entry in a menu: an item or a separator. */
export type DropdownMenuEntry = DropdownMenuItem | MenuSeparator;

/**
 * Internal renderer props: the menu's own, and the state of the popover it
 * sits in, which the HOC hands down.
 */
export type MenuProps = DropdownMenuProps & {
  /** The state the trigger and its popover share. */
  panel: PanelState;
};
