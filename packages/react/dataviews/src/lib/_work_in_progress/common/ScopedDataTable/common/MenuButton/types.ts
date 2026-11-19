import type {
  DropdownMenuEntry,
  DropdownMenuItem,
  WithDropdownTriggerProps,
} from "../../../../../common/DropdownButtonStandIn/index.js";
import type { IconButtonStandInProps } from "../../../../../common/IconButtonStandIn/index.js";

/** The menu the button opens. */
export type MenuButtonMenuProps = {
  /** The menu's items and separators, in order. */
  readonly items: DropdownMenuEntry[];
  /** Called with the item chosen, before the menu closes. */
  readonly onSelect: (item: DropdownMenuItem) => void;
};

/** The icon button's props, less those its panel owns, and its menu's. */
export type MenuButtonProps =
  WithDropdownTriggerProps<IconButtonStandInProps> & {
    /** The menu the button opens; one identity while the menu holds. */
    readonly menuProps: MenuButtonMenuProps;
  };
