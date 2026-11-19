import type { Ref } from "react";
import type {
  DropdownMenuEntry,
  DropdownMenuItem,
  DropdownPanelHandle,
} from "../../../../../../../common/DropdownButtonStandIn/index.js";

/** What a menu button hands its panel: the menu and how it is named. */
export type PanelContextValue = {
  /** The menu's items and separators, in order. */
  readonly items: DropdownMenuEntry[];
  /** Called with the item chosen, before the menu closes. */
  readonly onSelect: (item: DropdownMenuItem) => void;
  /** The element naming the button, which names the menu too. */
  readonly labelledBy: string | undefined;
};

/**
 * Props of a menu button's panel.
 *
 * Exempt from the native-prop extension convention: what the trigger's
 * render function hands it, forwarding no caller's native props.
 */
export type PanelProps = {
  /** The panel's handle, from the render function. */
  readonly ref: Ref<DropdownPanelHandle>;
  /** The popover's id, which the trigger names. */
  readonly id: string;
  /** The trigger's id, which names the menu when no element does. */
  readonly triggerId: string;
};
