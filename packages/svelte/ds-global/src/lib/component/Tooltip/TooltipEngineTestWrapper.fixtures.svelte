<script lang="ts">
  import TooltipEngine from "./TooltipEngine.svelte";
  import type { TooltipEngineProps } from "./types.js";

  type Props = Omit<TooltipEngineProps, "children" | "message"> & {
    /** The message text, reactive. */
    text: string;
    /** The label of the target button, reactive. */
    label?: string;
  };

  const { text, label = "Target", ...rest }: Props = $props();
</script>

<TooltipEngine {...rest}>
  {#snippet message()}{text}{/snippet}
  <button type="button">{label}</button>
</TooltipEngine>
