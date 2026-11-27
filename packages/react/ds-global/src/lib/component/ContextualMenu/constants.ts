/** The root class of a menu's list, open or closed. */
export const LIST_CLASS_NAME = "ds contextual-menu-list";

/** A menu item. */
export const MENU_ITEM = ".ds.contextual-menu-item";

const LIST = `.${LIST_CLASS_NAME.replace(" ", ".")}`;

/** An item of the open menu's first level, submenu parents included. */
export const TOP_LEVEL_ITEM = [
  `${LIST} >`,
  `${LIST} > .ds.contextual-menu-submenu >`,
]
  .map((path) => `${path} [role=menuitem]`)
  .join(", ");
