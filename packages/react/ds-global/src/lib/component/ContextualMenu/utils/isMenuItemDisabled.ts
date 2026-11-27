import type { NavigationItem } from "../common/index.js";

/**
 * Whether a menu item is disabled, as given or as the navigation tree
 * holds it.
 *
 * @param item The item.
 * @returns Whether it is disabled.
 */
export default function isMenuItemDisabled(item: NavigationItem): boolean {
  return Boolean(item.disabled || item.unavailable);
}
