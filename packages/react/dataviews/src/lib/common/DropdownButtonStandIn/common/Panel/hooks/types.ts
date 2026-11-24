import type { RefObject, ToggleEventHandler } from "react";

/**
 * Where focus goes when the menu opens: its first or last enabled item, the
 * item at an index (among all items) that had focus before hydration, or
 * nowhere, when focus was outside a menu opened before hydration.
 */
export type PanelFocusIntent = "first" | "last" | "none" | number;

/** The state one trigger and its menu's popover share. */
export type PanelState = {
  /** The popover's id. */
  panelId: string;
  /** The trigger's id. */
  triggerId: string;
  /** The CSS anchor name the trigger carries. */
  anchorName: string;
  /** The popover element. */
  elementRef: RefObject<HTMLDivElement | null>;
  /** Whether the popover is open, as its last `toggle` event reported. */
  isOpen: boolean;
  /** Records the open state the popover's `toggle` event reports. */
  setOpen: (isOpen: boolean) => void;
  /** Which item the menu focuses when it opens. */
  focusIntent: PanelFocusIntent;
  /** Sets which item the menu focuses when it next opens. */
  setFocusIntent: (focusIntent: PanelFocusIntent) => void;
  /** Opens the popover. Does nothing while it is open. */
  show: () => void;
  /** Closes the popover. Does nothing while it is closed. */
  hide: () => void;
};

/** What {@link usePanelState} needs: the ids and the anchor name. */
export type UsePanelStateProps = Pick<
  PanelState,
  "panelId" | "triggerId" | "anchorName"
>;

/** The shared state. */
export type UsePanelStateResult = PanelState;

/** The popover element's ref callback and its toggle listeners. */
export type UsePanelElementResult = {
  /** Attaches the popover element. */
  attachElement: (node: HTMLDivElement | null) => void;
  /** The popover's beforetoggle listener. */
  handleBeforeToggle: ToggleEventHandler<HTMLDivElement>;
  /** The popover's toggle listener. */
  handleToggle: ToggleEventHandler<HTMLDivElement>;
};
