import type { MenuEntry, MenuSeparator } from "@canonical/react-ds-global";
import type { AnnotatedMenuEntry } from "../hooks/types.js";

/**
 * Narrows a menu entry, raw or annotated, to a separator by its `type`.
 *
 * @param entry The menu entry to test.
 * @returns Whether the entry is a separator.
 */
export default function isMenuSeparator<
  TEntry extends MenuEntry | AnnotatedMenuEntry,
>(entry: TEntry): entry is Extract<TEntry, MenuSeparator> {
  return "type" in entry && entry.type === "separator";
}
