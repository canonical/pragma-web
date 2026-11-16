import type { DropdownMenuProps } from "../../types.js";
import type { PanelFocusIntent } from "../Panel/hooks/types.js";

/**
 * Internal renderer props: the open menu's items and its choice handler,
 * and what its popover hands it.
 */
export type MenuListProps = Pick<DropdownMenuProps, "items" | "onSelect"> & {
  /** Closes the menu's popover. */
  hide: () => void;
  /** Which item takes focus when the menu opens. */
  focusIntent: PanelFocusIntent;
  /** The menu's accessible name. */
  label?: string | undefined;
  /** The id of the element that names the menu, its trigger. */
  labelledBy?: string | undefined;
};
