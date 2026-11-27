<script lang="ts">
  import SpikeBox from "./SpikeBox.svelte";

  let { rows }: { rows: readonly string[] } = $props();
</script>

<div class="spike-rows">{#each rows as row (row)}<SpikeBox>{row}</SpikeBox>{/each}</div>

<!-- @component
A run of boxed cells sharing one border — the list/table-row case, laid out
inline on the bucket line (the CSS collapses the between-borders). Exercises
how per-cell external margin interacts with a shared border.
-->
