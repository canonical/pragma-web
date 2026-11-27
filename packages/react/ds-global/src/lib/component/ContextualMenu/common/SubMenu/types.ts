import type { _Item } from "@canonical/ds-types";
import type { MenuEntry } from "../../types.js";

/** One node's props. No single root: a rule, an item or a parent. */
export type SubMenuProps = {
  /** The node: a separator, a leaf or a submenu parent. */
  item: _Item<MenuEntry>;
};
