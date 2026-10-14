<script lang="ts">
  import { onDestroy } from "svelte";
  import { getChipContext } from "../../context.js";
  import type { ChipDismissProps } from "./types.js";
  import "./styles.css";

  let {
    class: className,
    children,
    type = "button",
    "aria-label": ariaLabel,
    ...rest
  }: ChipDismissProps = $props();

  const chipContext = getChipContext();
  onDestroy(chipContext.registerDismiss());
</script>

<button
  {...rest}
  {type}
  class={["dismiss", className]}
  aria-label={ariaLabel ?? chipContext.defaultDismissLabel}
>
  {#if children}
    {@render children()}
  {:else}
    <!-- TODO: Replace with appropriate dismiss icon when <Icon /> is ready -->
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
  {/if}
</button>
