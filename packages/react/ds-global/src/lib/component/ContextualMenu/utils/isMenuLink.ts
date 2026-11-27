import type { MenuEntry } from "../types.js";
import isMenuSeparator from "./isMenuSeparator.js";

/**
 * Whether an entry works before scripts run: an enabled item with a `url`.
 *
 * @param entry The menu entry.
 * @returns Whether it is a live link.
 */
export default function isMenuLink(entry: MenuEntry): boolean {
  return !isMenuSeparator(entry) && entry.url !== undefined && !entry.disabled;
}
