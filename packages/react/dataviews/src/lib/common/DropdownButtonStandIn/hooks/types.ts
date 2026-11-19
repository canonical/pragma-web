import type { CSSProperties, KeyboardEventHandler } from "react";
import type { PanelContextValue } from "../common/Panel/hooks/types.js";
import type {
  DropdownTriggerOwnedProps,
  WithDropdownRenderProps,
} from "../types.js";

/** What {@link useDropdownTrigger} reads from the trigger's props. */
export type UseDropdownTriggerProps = {
  /** The trigger's own id, when the consumer gives one. */
  id?: string | undefined;
  /** The trigger's own style, merged under the anchor name. */
  style?: CSSProperties | undefined;
  /** The trigger's own key handler, which runs before the HOC's. */
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement> | undefined;
};

/** The wiring {@link useDropdownTrigger} returns. */
export type UseDropdownTriggerResult = {
  /** The props the HOC sets on the trigger, after the consumer's. */
  triggerProps: DropdownTriggerOwnedProps & {
    id: string;
    style: CSSProperties;
    onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
  };
  /** What the render function receives. */
  renderProps: WithDropdownRenderProps;
  /** The state the trigger and its panel share. */
  contextValue: PanelContextValue;
};
