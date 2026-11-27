<script lang="ts">
  import type { Adornment } from "../../subcomponent/types.js";

  let { content }: { content: Adornment } = $props();
</script>

{#if typeof content === "string"}{content}{:else}{@render content()}{/if}

<!-- @component
Renders a prefix or suffix given as text or as a snippet.
-->
