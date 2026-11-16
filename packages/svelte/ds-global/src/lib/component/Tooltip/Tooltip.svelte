<script lang="ts">
  import "./styles.css";
  import type { TooltipProps } from "./types.js";

  const componentCssClassName = "ds tooltip";
  const arrowPlacement = {
    left: "right",
    right: "left",
    up: "bottom",
    down: "top",
  } as const;

  let {
    class: className,
    children,
    icon,
    isOpen = false,
    zIndex = 10,
    maxWidth = "284",
    arrow,
    ...rest
  }: TooltipProps = $props();
</script>

<div
  {...rest}
  class={[componentCssClassName, className]}
  role="tooltip"
  aria-hidden={!isOpen}
  data-open={isOpen}
  data-placement={ arrow ? arrowPlacement[arrow] : rest["data-placement"]}
  style:z-index={zIndex}
  style:max-width={maxWidth + "px"}
>
  <div class="content">
    {#if icon}
      <span class="icon" aria-hidden="true">
        {@render icon()}
      </span>
    {/if}
    {@render children()}
  </div>
</div>

<!-- @component
Displays tooltip content without positioning or interaction logic.

## Example Usage
```svelte
<Tooltip {...rest}>
     {#snippet icon()}
          <InformationIcon />
        {/snippet}
      Lorem ipsum dolor sit amet
    </Tooltip>
```

@implements ds:global.component.tooltip
-->