import type { _Item } from "@canonical/ds-types";
import type { MenuEntry, MenuSeparator } from "../types.js";

/**
 * Narrows a menu entry, raw or annotated, to a separator by its `type`.
 *
 * @param entry The menu entry to test.
 * @returns Whether the entry is a separator.
 */
export default function isMenuSeparator(
  entry: MenuEntry | _Item<MenuEntry>,
): entry is MenuSeparator | _Item<MenuSeparator> {
  return "type" in entry && entry.type === "separator";
}
