import type { ButtonProps } from "@canonical/react-ds-global";
import type { ComponentProps, ReactNode, Ref } from "react";
import type {
  DropdownPanelHandle,
  WithDropdownTriggerProps,
} from "../../common/withDropdownButtonStandIn/index.js";
import type { QueryChipCondition } from "../QueryChip/index.js";

/**
 * The applied clause's Condition, which picks the mark.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonCondition = QueryChipCondition;

/**
 * The panel's imperative handle, which `panelRef` takes.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonPanelHandle = DropdownPanelHandle;

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

/**
 * FilterButton's props: its own, and Button's, less `importance` and
 * `anticipation`, since the face is fixed at Tertiary and neutral, and the
 * keys the dropdown owns. They reach the trigger.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterButtonProps = OwnProps &
  Omit<
    WithDropdownTriggerProps<ButtonProps>,
    keyof OwnProps | "importance" | "anticipation" | "children"
  >;

/** What FilterButton shares with its panel, which the dropdown renders. */
export type FilterButtonContextValue = Pick<
  OwnProps,
  "children" | "onToggle" | "panelRef"
>;
