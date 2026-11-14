import type { ComponentProps, ReactNode, Ref } from "react";

/** A panel is named by its trigger (`aria-labelledby`) or by a label. */
type PanelName =
  | {
      /** The panel's accessible name. */
      "aria-label": string;
      /** The id of the element that names the panel, usually its trigger. */
      "aria-labelledby"?: string;
    }
  | {
      /** The panel's accessible name. */
      "aria-label"?: string;
      /** The id of the element that names the panel, usually its trigger. */
      "aria-labelledby": string;
    };

/** The panel's own props. */
type OwnProps = {
  /**
   * The handle, and the only way to drive the panel from script. Required:
   * the trigger's `close` and anything that takes the panel over act
   * through it.
   */
  ref: Ref<DropdownPanelHandle>;
  /** The popover's id. Required: the trigger's `popovertarget` names it. */
  id: string;
  /** Any content, such as a checkbox list in a form or a search field. */
  children: ReactNode;
};

/**
 * Native `<div>` props, so `className`, `style`, `data-*`, `onToggle` and
 * `onBeforeToggle` all reach the panel. `popover`, `role` and `tabIndex`
 * belong to the panel. There is no `open` prop: the open state lives in the
 * element, and `onToggle` (`event.newState`) reports every change.
 */
export type DropdownPanelProps = OwnProps &
  PanelName &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps
    | "aria-label"
    | "aria-labelledby"
    | "popover"
    | "role"
    | "tabIndex"
  >;

/** The handle the panel's `ref` receives, after the Popover API's own verbs. */
export type DropdownPanelHandle = {
  /** Opens the panel. Does nothing while it is open. */
  show: () => void;
  /** Closes the panel. Does nothing while it is closed. */
  hide: () => void;
  /** Opens a closed panel, or closes an open one. */
  toggle: () => void;
  /** The popover element, for anything the handle does not cover. */
  readonly element: HTMLDivElement | null;
};
