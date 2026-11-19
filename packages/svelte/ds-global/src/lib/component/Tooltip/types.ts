import type { Placement } from "@floating-ui/dom";
import type { Snippet } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = Omit<SvelteHTMLElements["div"], "children">;

export type TooltipTriggerProps = {
  "aria-describedby": string;
  [key: symbol]: Attachment<HTMLElement>;
};

export interface TooltipProps extends BaseProps {
  /** Content displayed inside the tooltip. */
  children: Snippet;
  /** An optional decorative leading icon. */
  icon?: Snippet;
  /** Whether the tooltip is visible. */
  isOpen?: boolean;
  /** Override the z-index of the tooltip. */
  zIndex?: number;
  /** Arrow element*/
  arrow?: "left" | "right" | "up" | "down";

  /** Maximum width of the tooltip in px. */
  maxWidth?: string;
}

export interface TooltipEngineProps
  extends Omit<TooltipProps, "children" | "isOpen" | "arrow"> {
  children: Snippet<[triggerProps: TooltipTriggerProps]>;
  message: Snippet;
  /**
   * Ordered preferred placements for the tooltip.
   *
   * @default ["right", "left", "top", "bottom"]
   */
  preferredDirections?: Placement[];
  /**
   * If set to true, the tooltip will try to find an alternative position if the preferred directions are not suitable.
   *
   * @default false
   */
  autoFit?: boolean;
  /**
   * Whether the popup closes when the Escape key is pressed. Defaults to true.
   *
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Delay in milliseconds before showing the tooltip after the user hovers or focuses the trigger element.

   * @default 400
   */
  activateDelay?: number;
  /**
   * Delay in milliseconds before hiding the tooltip after the user stops hovering or focusing the trigger element.

   * @default 400
   */
  deactivateDelay?: number;
  /**
   * The distance, in pixels between the target and the popup.
   * @TODO support non-px units. E.G., someone should be able to request '1em`.
   *
   * @default "12"
   */
  distance?: string;
}
