<script lang="ts">
  import type { TooltipProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds tooltip";

  const {
    children,
    icon,
    class: className,
    style,
    isOpen = false,
    zIndex,
    ...rest
  }: TooltipProps = $props();
</script>

<!--
  Native attributes (id, attachments, onpointerenter, onfocus, …) are spread
  first; the design-system attributes (role, aria-hidden, class, visibility)
  come after so they win. The icon+text row lives in an inner wrapper so the
  arrow `::before` on the outer box is never a flex item (which would displace
  it). The markup is written without whitespace between tags, matching the
  React component's output.
-->
<div
  {...rest}
  class={[componentCssClassName, className]}
  role="tooltip"
  aria-hidden={!isOpen}
  {style}
  style:visibility={isOpen ? "visible" : "hidden"}
  style:z-index={zIndex}
><span class="content">{#if icon}<span class="icon" aria-hidden="true">{@render icon()}</span>{/if}<span class="text">{@render children()}</span></span></div>

<!-- @component
The Tooltip renders the message part of a tooltip. It has no interactivity or
positioning logic and is generally consumed through `TooltipEngine`.

`import { Tooltip } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Tooltip isOpen class="top">Lorem ipsum dolor sit amet</Tooltip>
```

@implements ds:global.component.tooltip
-->
