import type { RefObject, ToggleEventHandler } from "react";

/**
 * The state one trigger and its panel share. The trigger's HOC provides it
 * around the panel, and a panel composed directly provides its own.
 */
export type PanelContextValue = {
  /** The popover's id. */
  panelId: string;
  /** The trigger's id. Absent when the panel is composed directly. */
  triggerId?: string;
  /** The CSS anchor name the trigger carries. Absent when composed directly. */
  anchorName?: string;
  /** Whether the panel is open, as its last `toggle` event reported. */
  isOpen: boolean;
  /** Records the open state the panel's `toggle` event reports. */
  setOpen: (isOpen: boolean) => void;
};

/** What {@link usePanelState} needs: the ids and the anchor name. */
export type UsePanelStateProps = Pick<
  PanelContextValue,
  "panelId" | "triggerId" | "anchorName"
>;

/** The shared panel state, which is the context value. */
export type UsePanelStateResult = PanelContextValue;

/** The panel context, or undefined outside a panel or a trigger's HOC. */
export type UsePanelContextResult = PanelContextValue | undefined;

/** What {@link usePanelElement} needs to keep the state and the element in step. */
export type UsePanelElementProps = {
  /** The panel's element ref, which the handle also reads. */
  elementRef: RefObject<HTMLDivElement | null>;
  /** The panel state the element reports to. */
  panel: PanelContextValue;
  /** The consumer's toggle listener, which runs first. */
  onToggle?: ToggleEventHandler<HTMLDivElement>;
  /** The consumer's beforetoggle listener, which runs first. */
  onBeforeToggle?: ToggleEventHandler<HTMLDivElement>;
};

/** The element's ref callback and its toggle listeners. */
export type UsePanelElementResult = {
  /** Attaches the popover element. */
  attachElement: (node: HTMLDivElement | null) => void;
  /** The panel's beforetoggle listener. */
  handleBeforeToggle: ToggleEventHandler<HTMLDivElement>;
  /** The panel's toggle listener. */
  handleToggle: ToggleEventHandler<HTMLDivElement>;
};
