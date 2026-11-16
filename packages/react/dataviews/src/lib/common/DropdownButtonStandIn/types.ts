import type { ComponentProps, MouseEvent } from "react";
import type {
  DropdownMenuEntry,
  DropdownMenuItem,
} from "./common/Menu/types.js";
import type { DistributiveOmit } from "./common/utils/types.js";

/**
 * The trigger keys the HOC owns: it sets them, and the component it returns
 * refuses them. `popoverTargetAction` is refused, because "show" or "hide"
 * would stop the trigger toggling its menu.
 */
export type DropdownTriggerOwnedProps = Pick<
  ComponentProps<"button">,
  | "popoverTarget"
  | "popoverTargetAction"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls"
>;

/**
 * What withDropdownMenu needs from its trigger: it renders a real
 * `<button>` and forwards these to it. Button and IconButton do. `onKeyDown`
 * carries the menu button's arrow keys.
 */
export type WithDropdownMenuTriggerProps = DropdownTriggerOwnedProps &
  Pick<ComponentProps<"button">, "id" | "type" | "style" | "onKeyDown">;

/** The menu's props, which the component an HOC returns takes beside the trigger's. */
export type DropdownMenuProps = {
  /**
   * Items and separators, in order, in ContextualMenu's entry shape with no
   * submenus. An item with a `url` is a link.
   */
  items: DropdownMenuEntry[];
  /**
   * Called with the chosen item and the click that chose it, before the
   * menu closes. For an item with a `url`, `event.preventDefault()` leaves
   * the navigation to a client router.
   */
  onSelect?:
    | ((item: DropdownMenuItem, event: MouseEvent<HTMLElement>) => void)
    | undefined;
  /** The menu's accessible name. Falls back to labelling by the trigger. */
  label?: string | undefined;
  /**
   * The ids of the elements that name the menu, set as its own
   * `aria-labelledby`. Defaults to the trigger's id. Give it when the trigger
   * is itself named by `aria-labelledby`, which a name does not follow
   * twice. It wins over `label`.
   */
  labelledBy?: string | undefined;
};

/**
 * The props of the component an HOC returns: the trigger's own, less the
 * keys the HOC owns, plus the menu's. The omission distributes over unions,
 * so a trigger's union of required names (`aria-label` or
 * `aria-labelledby`) survives.
 */
export type WithDropdownMenuProps<TProps> = DistributiveOmit<
  TProps,
  keyof DropdownTriggerOwnedProps | keyof DropdownMenuProps
> &
  DropdownMenuProps;
