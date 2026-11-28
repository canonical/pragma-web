import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { UseDisclosureProps } from "../../hooks/index.js";

/**
 * Props for the tooltip engine: everything the tooltip accepts, the target
 * `children` and the `message`. The disclosure options (placement, timing,
 * callbacks) are those of the hover-mode disclosure that drives it.
 */
export interface TooltipEngineProps extends Omit<UseDisclosureProps, "mode"> {
  /** The target element to which the tooltip is attached. */
  children: Snippet;
  /** The content of the tooltip. */
  message: Snippet;
  /**
   * An optional leading icon for the tooltip, rendered before the message
   * (Figma: 16px glyph, dimension-100 gap). Purely decorative.
   */
  icon?: Snippet;
  /**
   * Force the tooltip open (or closed), overriding hover/focus. When a boolean
   * is passed the tooltip is fully controlled and ignores pointer/keyboard —
   * useful for stories, visual tests, or driving the tooltip from outside.
   * Leave undefined for the default hover behaviour.
   */
  open?: boolean;
  /** Styles applied to the tooltip area */
  style?: string;
  /** Class applied to the tooltip area */
  class?: SvelteHTMLElements["span"]["class"];
  /** ID applied to the target element */
  targetElementId?: string;
  /** Class applied to the target element */
  targetElementClass?: SvelteHTMLElements["span"]["class"];
  /** Styles applied to the target element */
  targetElementStyle?: string;
  /** Class applied to the tooltip/message element */
  messageElementClass?: SvelteHTMLElements["div"]["class"];
  /** Styles applied to the tooltip/message element */
  messageElementStyle?: string;
  /**
   * The element the tooltip is portalled into. Defaults to `document.body`,
   * resolved on the client only.
   */
  parentElement?: HTMLElement;
}

type BaseProps = Omit<SvelteHTMLElements["div"], "children">;

/**
 * Props for the Tooltip message element, extending the native props of its
 * `<div>` root — so `id`, `class`, `style`, attachments and native handlers
 * such as `onpointerenter`/`onfocus` are all forwarded to the DOM node.
 */
export interface TooltipProps extends BaseProps {
  /** The message. */
  children: Snippet;
  /**
   * An optional leading icon, rendered before the text and top-aligned with the
   * first line (Figma: 16px glyph, dimension-100 gap). Pass any glyph (e.g. an
   * `<Icon>` or inline SVG).
   */
  icon?: Snippet;
  /** Whether the tooltip is open or not */
  isOpen?: boolean;
  /** The z-index of the tooltip */
  zIndex?: number;
}
