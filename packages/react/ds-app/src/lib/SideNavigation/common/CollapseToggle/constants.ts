import type { CollapseToggleMessages } from "./types.js";

/** The collapse toggle's English text, used for any message not supplied. */
export const DEFAULT_MESSAGES: CollapseToggleMessages = {
  collapseNavigation: () => "Collapse navigation",
  expandNavigation: () => "Expand navigation",
  collapse: () => "Collapse",
  expand: () => "Expand",
  openMenu: () => "Menu",
  closeMenu: () => "Close menu",
};
