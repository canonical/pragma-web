import type { ComponentProps } from "react";
import type { ContextualMenuProps } from "../../types.js";

/**
 * Where focus goes when the open menu mounts: its first or last item, the
 * index of the top-level item focused before hydration, or nowhere.
 */
export type MenuFocusIntent = "first" | "last" | "none" | number;

type OwnProps = Pick<
  ContextualMenuProps,
  "items" | "onSelect" | "label" | "labelledBy"
> & {
  /** Whether the arrow keys wrap. */
  wrap: boolean;
  /** Where focus goes once the menu mounts. */
  focusIntent: MenuFocusIntent;
  /** Closes the popover. */
  hide: () => void;
  /** Closes the popover and leaves focus to move on, as Tab does. */
  hideLeavingFocus: () => void;
};

/** The open menu's props: its own, and the native props of its `<div>`. */
export type MenuListProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
