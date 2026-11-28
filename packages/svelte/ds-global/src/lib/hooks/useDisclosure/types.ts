import type { UseDelayedToggleProps } from "../useDelayedToggle/index.js";
import type {
  UseWindowFitmentProps,
  UseWindowFitmentResult,
  WindowFitmentElements,
} from "../useWindowFitment/index.js";

/**
 * How the disclosure is triggered.
 * - `hover`: opens on pointer-enter / focus, closes on pointer-leave / blur,
 *   with a delay. Suits tooltips and other non-interactive overlays. There is
 *   no native HTML primitive for this; the hook owns the open state.
 * - `click`: toggles on click, closes on outside-click and Escape, and returns
 *   focus to the trigger on close. Suits popovers, menus, and dropdowns. This
 *   mode is complementary to a native `<details>`/`<summary>` (or a
 *   `<button aria-expanded>` + panel), which provides the no-JS baseline while
 *   the hook layers on positioning and dismissal after hydration.
 */
export type DisclosureMode = "hover" | "click";

export interface UseDisclosureProps
  extends UseWindowFitmentProps,
    Omit<UseDelayedToggleProps, "onActivate" | "onDeactivate"> {
  /** How the disclosure opens and closes. Defaults to `hover`. */
  mode?: DisclosureMode;
  /** An override for the open state. When boolean, the hook is controlled. */
  isOpen?: boolean;
  /** Called when the popup is shown. */
  onshow?: (event?: Event) => void;
  /** Called when the popup is hidden. */
  onhide?: (event?: Event) => void;
  /**
   * Whether the popup closes when the Escape key is pressed. Defaults to true.
   */
  closeOnEscape?: boolean;
  /**
   * Whether a `click` disclosure closes when a pointer-down occurs outside the
   * trigger and content. Ignored in `hover` mode. Defaults to true.
   */
  closeOnOutsideClick?: boolean;
  /**
   * Whether a `click` disclosure returns focus to the trigger when it closes.
   * Ignored in `hover` mode. Defaults to true.
   */
  returnFocus?: boolean;
  /** Called when the pointer enters the trigger (`hover` mode). */
  onenter?: (event: PointerEvent) => void;
  /** Called when the pointer leaves the trigger (`hover` mode). */
  onleave?: (event: PointerEvent) => void;
  /** Called when the trigger is focused. */
  onfocus?: (event: FocusEvent) => void;
  /** Called when the trigger loses focus. */
  onblur?: (event: FocusEvent) => void;
}

/**
 * The elements the disclosure wires: the trigger, which a `click`
 * disclosure returns focus to, and the content (popup).
 */
export type DisclosureElements = WindowFitmentElements;

/**
 * Attributes to spread onto the trigger element. The trigger is whatever the
 * component chooses to render (a `<button>`, a `<summary>`, a `<span>`); the
 * hook stays element-agnostic.
 */
export interface DisclosureToggleProps {
  /** Reflects the open state for assistive tech (`click` mode). */
  "aria-expanded"?: boolean;
  /** Points at the content element (`click` mode). */
  "aria-controls"?: string;
  /** Associates the trigger with its description (`hover` mode). */
  "aria-describedby"?: string;
  onclick?: (event: MouseEvent) => void;
  onkeydown?: (event: KeyboardEvent) => void;
  onpointerenter?: (event: PointerEvent) => void;
  onpointerleave?: (event: PointerEvent) => void;
  onfocus?: (event: FocusEvent) => void;
  onblur?: (event: FocusEvent) => void;
}

/** Attributes to spread onto the content (popup) element. */
export interface DisclosureContentProps {
  /** Stable id, matched by the trigger's `aria-controls` / `aria-describedby`. */
  id: string;
  /** Hidden from layout and assistive tech while closed. */
  hidden?: boolean;
  onpointerenter?: (event: PointerEvent) => void;
  onpointerleave?: (event: PointerEvent) => void;
}

export type DisableableElement = HTMLElement & {
  disabled: boolean;
};

export interface UseDisclosureResult extends UseWindowFitmentResult {
  /** Whether the disclosure is currently open. */
  readonly isOpen: boolean;
  /** Whether the trigger is currently focused. */
  readonly isFocused: boolean;
  /** Imperatively open the disclosure. */
  open: () => void;
  /** Imperatively close the disclosure. */
  close: () => void;
  /** Imperatively toggle the disclosure. */
  toggle: () => void;
  /** The id of the content element (associates trigger and content). */
  readonly popupId: string;
  /** Prop-getter for the trigger element. */
  getToggleProps: () => DisclosureToggleProps;
  /** Prop-getter for the content (popup) element. */
  getContentProps: () => DisclosureContentProps;
}
