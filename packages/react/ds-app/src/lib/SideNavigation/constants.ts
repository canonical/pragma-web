import { DEFAULT_MESSAGES as COLLAPSE_TOGGLE_MESSAGES } from "./common/CollapseToggle/constants.js";
import type { SideNavigationMessages } from "./types.js";

/** SideNavigation's English text, used for any message not supplied. */
export const DEFAULT_MESSAGES: SideNavigationMessages = {
  ...COLLAPSE_TOGGLE_MESSAGES,
  skipToContent: () => "Skip to main content",
  navigation: () => "Main navigation",
};
