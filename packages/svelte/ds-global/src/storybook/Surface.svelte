<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<div
  class="surface"
  style="background: var(--surface-color-background); color: var(--surface-color-text); padding: var(--dimension-300, 24px);"
>
  {@render children?.()}
</div>
