import type { CSSProperties, KeyboardEventHandler } from "react";
import type { PanelState } from "../common/Panel/hooks/types.js";
import type { DropdownTriggerOwnedProps } from "../types.js";

/** What {@link useDropdownTrigger} reads from the trigger's props. */
export type UseDropdownTriggerOptions = {
  /** The trigger's own id, when the consumer gives one. */
  readonly id?: string | undefined;
  /** The trigger's own style, merged under the anchor name. */
  readonly style?: CSSProperties | undefined;
  /** The trigger's own key handler, which runs before the HOC's. */
  readonly onKeyDown?: KeyboardEventHandler<HTMLButtonElement> | undefined;
};

/** What {@link useDropdownTrigger} takes: the trigger's own props, all optional. */
export type UseDropdownTriggerProps = readonly [
  options?: UseDropdownTriggerOptions,
];

/** The wiring {@link useDropdownTrigger} returns. */
export type UseDropdownTriggerResult = {
  /** The props the HOC sets on the trigger, after the consumer's. */
  triggerProps: DropdownTriggerOwnedProps & {
    id: string;
    style: CSSProperties;
    onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
  };
  /** The state the trigger and its menu's popover share. */
  panel: PanelState;
};
