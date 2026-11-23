import type { ButtonProps } from "@canonical/react-ds-global";
import type { ComponentProps, ReactNode, Ref } from "react";
import type { QueryChipCondition } from "../QueryChip/index.js";

/**
 * The applied clause's Condition, which picks the mark.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonCondition = QueryChipCondition;

/**
 * The panel's imperative handle, which `panelRef` takes, after the Popover
 * API's own verbs.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonPanelHandle = {
  /** Opens the panel. Does nothing while it is open. */
  show: () => void;
  /** Closes the panel. Does nothing while it is closed. */
  hide: () => void;
  /** Opens a closed panel, or closes an open one. */
  toggle: () => void;
  /** The popover element, for anything the handle does not cover. */
  readonly element: HTMLDivElement | null;
};

/**
 * The applied count and its words. A count above 0 needs `appliedLabel`,
 * which FilterButton checks when it renders, since a number type cannot say
 * "above 0".
 */
type AppliedProps =
  | {
      /** How many values the filter applies; 0 means none. */
      applied?: 0 | undefined;
      /** The words for the count in the trigger's name. */
      appliedLabel?: string | undefined;
    }
  | {
      /** How many values the filter applies; 0 means none. */
      applied: number;
      /**
       * The words for the count in the trigger's name, such as "2 applied"
       * or "none of 2", from the host's messages.
       */
      appliedLabel: string;
    };

/** FilterButton's own props. */
type OwnProps = {
  /** The filter's name. */
  label: ReactNode;
  /**
   * The Condition value of the applied clause. While the filter applies, the
   * trigger shows its mark before the count.
   */
  condition?: FilterButtonCondition | undefined;
  /** The panel's content: a checkbox list, or any control. */
  children: ReactNode;
  /**
   * The panel's native toggle event, which fires however the panel opens or
   * closes: Escape, a click outside, the trigger or `hide()`.
   */
  onToggle?: ComponentProps<"div">["onToggle"] | undefined;
  /** The panel's handle, for a host that takes the filter over. */
  panelRef?: Ref<FilterButtonPanelHandle> | undefined;
} & AppliedProps;

/** The trigger keys FilterButton sets to tie the trigger to its panel. */
type PanelOwnedKeys =
  | "popoverTarget"
  | "popoverTargetAction"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls";

/**
 * FilterButton's props: its own, and Button's, less `importance` and
 * `anticipation`, since the face is fixed at Tertiary and neutral, and the
 * keys that tie the trigger to its panel. They reach the trigger.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonProps = OwnProps &
  Omit<
    ButtonProps,
    keyof OwnProps | "importance" | "anticipation" | "children" | PanelOwnedKeys
  >;
