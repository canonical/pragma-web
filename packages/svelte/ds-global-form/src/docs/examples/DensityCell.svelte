<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    context = "app",
    density = "comfortable",
    children,
  }: {
    context?: "app" | "site" | "docs";
    density?: "comfortable" | "dense";
    children: Snippet;
  } = $props();
</script>

<div class="{context} {density}">
  <div class="density-example__row">{@render children()}</div>
</div>

<!-- @component
A named density cell: applies `.<context>` + `.<density>` on a wrapper so the
controls inside size and seat to that exact cell of the matrix.
-->
