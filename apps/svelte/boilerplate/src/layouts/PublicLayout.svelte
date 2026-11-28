<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
  }: {
    /** The public page. */
    children?: Snippet;
  } = $props();
</script>

<main class="subgrid public-content surface">{@render children?.()}</main>

<!-- @component
The public pages' layout: one constrained column under the top bar. It is a
`.surface`, the context the design system's components read their colours
from.
-->
