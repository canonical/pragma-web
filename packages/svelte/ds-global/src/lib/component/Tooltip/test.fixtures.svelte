<script lang="ts" module>
  import type { TooltipTriggerProps } from "./types.js";

  export const childrenLabel = "Tooltip content";
  export const triggerLabel = "Tooltip trigger";
  export const iconLabel = "Tooltip icon";

  export { children, icon, trigger };
</script>

{#snippet trigger(triggerProps: TooltipTriggerProps)}
  <button {...triggerProps}>{triggerLabel}</button>
{/snippet}

{#snippet children()}
  <span>{childrenLabel}</span>
{/snippet}

{#snippet icon()}
  <span>{iconLabel}</span>
{/snippet}
