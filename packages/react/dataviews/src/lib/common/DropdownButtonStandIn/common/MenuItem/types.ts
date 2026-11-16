import type { MouseEvent } from "react";
import type { DropdownMenuItem } from "../Menu/types.js";

/**
 * Internal renderer props, exempt from the native-prop extension: MenuItem is
 * private and has two possible roots, `<a>` for an item with a `url` and
 * `<div>` otherwise. Once the menu is open it receives the menu hook's ARIA
 * and roving props and spreads them onto whichever root it renders.
 */
export type MenuItemProps = {
  /** The item to render. */
  item: DropdownMenuItem;
  /** The menu hook's ARIA and roving props, while the menu is open. */
  itemProps?:
    | (Record<string, unknown> & {
        onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
      })
    | undefined;
  /**
   * Called when the item is chosen: a plain primary click, or Enter or Space,
   * on an enabled item. Absent before scripts run.
   */
  onSelect?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
};
