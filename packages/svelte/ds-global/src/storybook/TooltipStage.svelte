<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<!--
  The tooltip is `position: fixed`, so it does not contribute to the story's
  flow height. This stage reserves a tall, centred surface so the docs canvas
  does not collapse to the anchor alone.
-->
<div
  class="surface"
  style="display: flex; align-items: center; justify-content: center; inline-size: 100%; block-size: 100%; min-inline-size: min(88vw, 480px); min-block-size: 440px; background: var(--surface-color-background); color: var(--surface-color-text);"
>
  {@render children?.()}
</div>
