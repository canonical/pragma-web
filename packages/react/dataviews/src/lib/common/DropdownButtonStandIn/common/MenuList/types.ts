import type { ComponentProps } from "react";
import type { DropdownMenuProps } from "../Menu/types.js";
import type { PanelFocusIntent } from "../Panel/hooks/types.js";

/** What the open menu needs from its panel, beyond the menu's own props. */
type OwnProps = {
  /** Closes the panel. */
  hide: () => void;
  /** Which item takes focus when the menu opens. */
  focusIntent: PanelFocusIntent;
  /** The panel's `aria-label`, which names the menu. */
  label?: string | undefined;
  /** The panel's `aria-labelledby`, which names the menu. */
  labelledBy?: string | undefined;
};

/**
 * The open menu's props: the menu's own, plus what its panel hands it. It
 * renders the same `<div>` the closed menu does, now with `role="menu"`.
 */
export type MenuListProps = OwnProps &
  Pick<DropdownMenuProps, "items" | "onSelect"> &
  Omit<
    ComponentProps<"div">,
    keyof OwnProps | "role" | "children" | "onSelect"
  >;
