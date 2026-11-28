<script lang="ts">
  import { useDisclosure, useIsMounted } from "../../hooks/index.js";
  import Tooltip from "./Tooltip.svelte";
  import type { TooltipEngineProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds tooltip-area";

  const {
    children,
    style,
    class: className,
    message,
    icon,
    open,
    distance = "16px",
    maxWidth = "var(--tooltip-max-width)",
    targetElementId,
    targetElementClass,
    targetElementStyle,
    messageElementClass,
    messageElementStyle,
    parentElement,
    ...rest
  }: TooltipEngineProps = $props();

  const popupId = $props.id();
  let targetRef = $state<HTMLSpanElement>();
  let popupRef = $state<HTMLDivElement>();

  // `open` is the public alias for the disclosure's controlled `isOpen`; when
  // set it overrides hover/focus so the tooltip stays in the given state.
  const disclosure = useDisclosure(
    () => ({
      ...rest,
      distance,
      maxWidth,
      isOpen: open ?? rest.isOpen,
      mode: "hover",
    }),
    popupId,
    {
      get target() {
        return targetRef;
      },
      get popup() {
        return popupRef;
      },
    },
  );

  const triggerProps = $derived(disclosure.getToggleProps());
  const contentProps = $derived(disclosure.getContentProps());

  // The message is portalled on the client only. Rendering it on the server
  // (or on the first client render) would differ from the post-mount output
  // and mismatch hydration. Deferring to a mounted gate makes the server and
  // first client render identical (nothing at the call site); the tooltip
  // mounts once, cleanly, after hydration.
  const mounted = useIsMounted();

  // The always-on arrow offset keeps the arrow pointing at the target centre
  // for every placement, not only when auto-fit clamps.
  const arrowStyle = $derived.by(() => {
    const offset = disclosure.arrowOffset;
    if (!offset) return undefined;
    const property =
      offset.axis === "x"
        ? "--tooltip-arrow-offset-left"
        : "--tooltip-arrow-offset-top";
    return `${property}: ${offset.offset}px`;
  });

  const tooltipStyle = $derived(
    [messageElementStyle, disclosure.popupPositionStyle, arrowStyle]
      .filter(Boolean)
      .join("; "),
  );

  /**
   * Moves the message into `parentElement` (default `document.body`), so it
   * escapes scrollable or clipping ancestors, and tracks it as the popup.
   */
  const portalAsPopup = (node: HTMLDivElement) => {
    (parentElement ?? document.body).appendChild(node);
    popupRef = node;
    return () => {
      popupRef = undefined;
      node.remove();
    };
  };
</script>

<!--
  The wrapper forwards pointer and focus to the tooltip trigger. Focus
  listeners use `focusin`/`focusout`, so focus moving onto any element inside
  the target reveals the tooltip. The markup is written without whitespace
  between tags, matching the React component's output.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class={[componentCssClassName, className]} {style} onfocusin={triggerProps.onfocus} onfocusout={triggerProps.onblur} onpointerenter={triggerProps.onpointerenter} onpointerleave={triggerProps.onpointerleave}><span id={targetElementId} style={targetElementStyle} class={["target", targetElementClass]} bind:this={targetRef} aria-describedby={popupId}>{@render children()}</span>{#if mounted.current}<Tooltip {@attach portalAsPopup} id={popupId} class={[disclosure.bestPosition?.positionName, messageElementClass]} {icon} onpointerenter={contentProps.onpointerenter} style={tooltipStyle} isOpen={disclosure.isOpen && Boolean(disclosure.bestPosition)}>{@render message()}</Tooltip>{/if}</span>

<!-- @component
The tooltip engine: wraps a target with a hover/focus tooltip. It drives a
hover-mode disclosure, portals the message on the client only, positions it
against the target span, and points the arrow. It is the Svelte form of the
React `withTooltip` higher-order component: `children` is the target and the
`message` snippet is the tooltip content, which stays reactive.

The message is revealed only once a position has been resolved, so the
unpositioned first frame stays hidden and never paints at 0,0.

`import { TooltipEngine } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<TooltipEngine>
  {#snippet message()}Copy to clipboard{/snippet}
  <Button importance="tertiary">Copy</Button>
</TooltipEngine>
```
-->
