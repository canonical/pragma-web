<script lang="ts">
  import "./styles.css";
  import type { TooltipProps } from "./types.js";

  const componentCssClassName = "ds tooltip";

  let {
    ref = $bindable(),
    class: className,
    children,
    icon,
    isOpen = false,
    zIndex = 10,
    maxWidth = "284",
    position,
    ...rest
  }: TooltipProps = $props();
</script>

<div
  bind:this={ref}
  class={[componentCssClassName, className]}
  role="tooltip"
  aria-hidden={!isOpen}
  data-open={isOpen}
  data-placement={position}
  style:z-index={zIndex}
  style:max-width={maxWidth + "px"}
  {...rest}
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
@implements ds:global.component.tooltip_wrapper
-->