import type {
  ComponentProps,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
} from "react";

/**
 * The contract of `withDropdownButton` and `DropdownPanel`, copied from the
 * DropdownButton pull request so that FilterButton builds against it before
 * that lands. The stand-in implements panel mode only.
 *
 * @experimental A stand-in, removed when DropdownButton lands.
 */

/** The trigger keys the HOC owns: it sets them, and the component it returns refuses them. */
export type DropdownTriggerOwnedProps = Pick<
  ComponentProps<"button">,
  | "popoverTarget"
  | "popoverTargetAction"
  | "aria-haspopup"
  | "aria-expanded"
  | "aria-controls"
>;

/** What the HOC needs from its trigger: it renders a real `<button>` and forwards these to it. */
export type WithDropdownPanelTriggerProps = DropdownTriggerOwnedProps &
  Pick<ComponentProps<"button">, "id" | "type" | "style" | "onKeyDown">;

/** withDropdownButton's trigger also takes `children`, which the chevron follows, and `className`. */
export type WithDropdownButtonTriggerProps = WithDropdownPanelTriggerProps &
  Pick<ComponentProps<"button">, "children" | "className">;

/** The props of the component the HOC returns: the trigger's own, less the keys the HOC owns. */
export type WithDropdownTriggerProps<TProps> = TProps extends unknown
  ? Omit<TProps, keyof DropdownTriggerOwnedProps>
  : never;

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

/** What the HOC hands its render function. */
export type WithDropdownRenderProps = {
  /** Closes the panel. Focus returns to the trigger. */
  close: () => void;
  /** The panel's handle. MUST be set on the `<DropdownPanel>`. */
  ref: RefObject<DropdownPanelHandle | null>;
  /** The panel's id. MUST be set on the `<DropdownPanel>`. */
  id: string;
  /** The trigger's id, for the panel's `aria-labelledby`. */
  triggerId: string;
};

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
type PanelOwnProps = {
  /** The handle, and the only way to drive the panel from script. */
  ref: Ref<DropdownPanelHandle>;
  /** The popover's id, which the trigger's `popovertarget` names. */
  id: string;
  /** Any content, such as a checkbox list in a form or a search field. */
  children: ReactNode;
};

/** The panel's props: native `<div>` props, less `popover`, `role` and `tabIndex`, which belong to the panel. */
export type DropdownPanelProps = PanelOwnProps &
  PanelName &
  Omit<
    ComponentProps<"div">,
    | keyof PanelOwnProps
    | "aria-label"
    | "aria-labelledby"
    | "popover"
    | "role"
    | "tabIndex"
  >;

/** The second argument of the HOC: it returns the complete `<DropdownPanel>`. */
export type WithDropdownRender = (
  props: WithDropdownRenderProps,
) => ReactElement<DropdownPanelProps>;

/** What a trigger shares with its panel: the open state the panel reports. */
export type PanelContextValue = {
  /** Records the open state the panel's `toggle` event reports. */
  setOpen: (isOpen: boolean) => void;
  /** The CSS anchor name the trigger carries, which the panel is placed by. */
  anchorName: string;
  /** The trigger's id, which takes focus back when the panel closes. */
  triggerId: string;
};
