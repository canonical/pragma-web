import type { RefObject, ToggleEventHandler } from "react";

/** What a panel holds: any controls, or a menu. */
export type PanelKind = "dialog" | "menu";

/**
 * Where focus goes when a menu opens: its first or last enabled item, the
 * item at an index (among all items) that had focus before hydration, or
 * nowhere, when focus was outside a menu opened before hydration.
 */
export type PanelFocusIntent = "first" | "last" | "none" | number;

/**
 * The state one trigger and its panel share. The trigger's HOC provides it
 * around the panel, and a panel composed directly provides its own.
 */
export type PanelContextValue = {
  /** The popover's id. */
  panelId: string;
  /** The trigger's id. Absent when the panel is composed directly. */
  triggerId?: string | undefined;
  /** The CSS anchor name the trigger carries. Absent when composed directly. */
  anchorName?: string | undefined;
  /** Whether the panel is open, as its last `toggle` event reported. */
  isOpen: boolean;
  /** Records the open state the panel's `toggle` event reports. */
  setOpen: (isOpen: boolean) => void;
  /** `menu` while a `DropdownPanel.Menu` is mounted inside, else `dialog`. */
  kind: PanelKind;
  /** Marks the panel as a menu's, and returns the function that unmarks it. */
  registerMenu: () => () => void;
  /** Which item a menu focuses when it opens. */
  focusIntent: PanelFocusIntent;
  /** Sets which item a menu focuses when it next opens. */
  setFocusIntent: (focusIntent: PanelFocusIntent) => void;
  /** Closes the panel through its element. Does nothing while it is closed. */
  hide: () => void;
  /** The panel's `aria-label`, which a menu inside takes as its own. */
  label?: string | undefined;
  /** The panel's `aria-labelledby`, which a menu inside takes as its own. */
  labelledBy?: string | undefined;
};

/**
 * What {@link usePanelState} needs: the ids, the anchor name, and the way to
 * close the panel through its element.
 */
export type UsePanelStateProps = Pick<
  PanelContextValue,
  "panelId" | "triggerId" | "anchorName" | "hide"
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
  onToggle?: ToggleEventHandler<HTMLDivElement> | undefined;
  /** The consumer's beforetoggle listener, which runs first. */
  onBeforeToggle?: ToggleEventHandler<HTMLDivElement> | undefined;
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
