<script lang="ts" module>
  import { ChainingManager } from "./utils/index.js";

  const chainingManager = new ChainingManager(400);
</script>

<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { createAttachmentKey } from "svelte/attachments";
  import { isEventTargetInElement } from "../../utils/index.js";
  import type { TooltipEngineProps } from "./types.js";
  import { Tooltip } from "./index.js";
  import {
    DEFAULT_PLACEMENTS,
    useDelayedOpenClose,
    useTooltipPosition,
  } from "./utils/index.js";

  let {
    id: idProp,
    class: className,
    children,
    message,
    preferredDirections = DEFAULT_PLACEMENTS,
    autoFit = false,
    activateDelay = 400,
    deactivateDelay = 400,
    distance = "12", // px
    closeOnEscape = true,
    onmouseleave,
    onmouseenter,
    style,
    ...rest
  }: TooltipEngineProps = $props();

  const fallbackId = $props.id();
  const id = $derived(idProp || fallbackId);
  let tooltipRef = $state<HTMLElement>();
  let triggerRef = $state<HTMLElement>();

  const tooltipRefAttachment: Attachment<HTMLElement> = (element) => {
    tooltipRef = element;
    return () => {
      tooltipRef = undefined;
    };
  };

  let isTriggerFocused = $state(false);
  let isTriggerHovered = $state(false);
  let isTooltipHovered = $state(false);
  const open = $derived(
    isTriggerFocused || isTriggerHovered || isTooltipHovered,
  );

  const listenersTriggerAttachment: Attachment<HTMLElement> = (element) => {
    triggerRef = element;
    const abortController = new AbortController();
    element.addEventListener("mouseenter", () => (isTriggerHovered = true), {
      signal: abortController.signal,
    });
    element.addEventListener(
      "mouseleave",
      (e) => {
        // Check if hover moved to the tooltip, to avoid any flicker before `mouseenter` on the tooltip is fired and handled
        if (isEventTargetInElement(e.relatedTarget, tooltipRef)) {
          isTooltipHovered = true;
        }
        isTriggerHovered = false;
      },
      { signal: abortController.signal },
    );
    element.addEventListener("focus", () => (isTriggerFocused = true), {
      signal: abortController.signal,
    });
    element.addEventListener("blur", () => (isTriggerFocused = false), {
      signal: abortController.signal,
    });
    return () => {
      triggerRef = undefined;
      abortController.abort();
      isTriggerHovered = false;
      isTriggerFocused = false;
    };
  };

  const tooltipOnmouseenter: typeof onmouseenter = (e) => {
    onmouseenter?.(e);
    isTooltipHovered = true;
  };

  const tooltipOnmouseleave: typeof onmouseleave = (e) => {
    onmouseleave?.(e);
    // Check if hover moved to the trigger, to avoid any flicker before `mouseenter` on the trigger is fired and handled
    if (isEventTargetInElement(e.relatedTarget, triggerRef))
      isTriggerHovered = true;
    isTooltipHovered = false;
  };

  const distanceAsPixelsNumber = $derived(
    Number.parseInt(distance, 10) || 0,
  );

  const {
    triggerAttachment: tooltipPositionTriggerAttachment,
    targetAttachment,
    tooltipPosition,
    getTooltipPlacement,
  } = useTooltipPosition(
    // Start positioning even before the tooltip is actually shown (`delayedOpen`)
    () => open,
    () => preferredDirections,
    () => autoFit,
    () => distanceAsPixelsNumber,
  );

  const getDelayedOpen = useDelayedOpenClose(
    () => open,
    () => activateDelay,
    () => deactivateDelay,
    chainingManager,
  );
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape" && closeOnEscape) {
      // If escape is pressed, close the tooltip no matter what caused it to open
      isTriggerFocused = false;
      isTriggerHovered = false;
      isTooltipHovered = false;
    }
  }}
/>

{@render children({
  "aria-describedby": id,
  [createAttachmentKey()]: tooltipPositionTriggerAttachment,
  [createAttachmentKey()]: listenersTriggerAttachment,
})}

<Tooltip
  {...rest}
  {...{
    [createAttachmentKey()]: targetAttachment,
    [createAttachmentKey()]: tooltipRefAttachment,
  }}
  {id}
  class={className}
  isOpen={getDelayedOpen()}
  style={`${style ?? ""}; top: ${tooltipPosition.top}; left: ${tooltipPosition.left}; --distance-to-trigger: ${distanceAsPixelsNumber}px;`}
  onmouseenter={tooltipOnmouseenter}
  onmouseleave={tooltipOnmouseleave}
  data-placement={getTooltipPlacement()}
  >
  {@render message()}
</Tooltip>  

<!-- @component
`Tooltip` are non-interactive elements that aim to provide additional information about a specific element or action.

Tooltip requires JavaScript to function correctly. If JavaScript is disabled, the tooltip content will not be accessible.
TODO(no-js): Investigate how to handle tooltips without JavaScript.

The tooltip enables "chaining" while it is visible and for a short window (~400ms) after the last tooltip closes. If any tooltip's trigger is hovered or focused during this time, the tooltip bypasses `activateDelay` and opens immediately.

## Example Usage
```svelte
<TooltipEngine preferredDirections={["top", "bottom"]} activateDelay={500} autoFit={true}>
  {#snippet trigger(triggerProps)}
    <Button {...triggerProps}>Hover or focus me</Button>
  {/snippet}
  I am a tooltip!
</TooltipEngine>
```

@implements ds:global.component.tooltip_wrapper
-->
