import type { _DistributiveOmit } from "@canonical/ds-types";
import type { ComponentProps, ReactElement, RefObject } from "react";
import type {
  DropdownPanelHandle,
  DropdownPanelProps,
} from "./common/Panel/index.js";

/**
 * The trigger keys the HOC owns: it sets them, and the component it returns
 * refuses them. `popoverTargetAction` is refused, because "show" or "hide"
 * would stop the trigger toggling its panel.
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
 * What withDropdownPanel needs from its trigger: it renders a real
 * `<button>` and forwards these to it. Button and IconButton do. `onKeyDown`
 * carries the menu button's arrow keys.
 */
export type WithDropdownPanelTriggerProps = DropdownTriggerOwnedProps &
  Pick<ComponentProps<"button">, "id" | "type" | "style" | "onKeyDown">;

/**
 * withDropdownButton's trigger also takes `children`, which the chevron
 * follows, and `className`.
 */
export type WithDropdownButtonTriggerProps = WithDropdownPanelTriggerProps &
  Pick<ComponentProps<"button">, "children" | "className">;

/**
 * The props of the component an HOC returns: the trigger's own, less the
 * keys the HOC owns. The omission distributes over unions, so a trigger's
 * union of required names (`aria-label` or `aria-labelledby`) survives.
 */
export type WithDropdownTriggerProps<TProps> = _DistributiveOmit<
  TProps,
  keyof DropdownTriggerOwnedProps
>;

/** What the HOC hands its render function. */
export type WithDropdownRenderProps = {
  /** Closes the panel. Focus returns to the trigger. */
  close: () => void;
  /** The panel's handle. MUST be set on the `<DropdownPanel>`. */
  ref: RefObject<DropdownPanelHandle | null>;
  /**
   * The panel's id. MUST be set on the `<DropdownPanel>`: the trigger's
   * `popovertarget` names it.
   */
  id: string;
  /** The trigger's id, for the panel's `aria-labelledby`. */
  triggerId: string;
};

/** The second argument of both HOCs: it returns the complete `<DropdownPanel>`. */
export type WithDropdownRender = (
  props: WithDropdownRenderProps,
) => ReactElement<DropdownPanelProps>;
