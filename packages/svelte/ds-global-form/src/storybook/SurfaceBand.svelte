<script lang="ts">
  import type { Snippet } from "svelte";
  import Self from "./SurfaceBand.svelte";

  let { level, content }: { level: number; content: Snippet<[number]> } =
    $props();
</script>

<!-- One surface band: a full-width row painting its own surface background,
     its content, then flush below the next, deeper band. The levels differ
     only by nesting, so the bands nest in the DOM to step colour. -->
<div
  class="surface"
  style="background: var(--surface-color-background, var(--color-background)); display: flex; flex-direction: column; align-items: stretch;"
>
  <div style="padding-block: 2.5rem; padding-inline: 5rem;">
    {@render content(level)}
  </div>
  {#if level < 2}
    <Self level={level + 1} {content} />
  {/if}
</div>

<!-- @component
Renders `content` inside three stacked `.surface` bands (level 1, 2, 3), so a
surface-aware control can be seen at each level.
-->
