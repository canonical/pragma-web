<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  let {
    class: className,
    children,
  }: { class?: ClassValue; children?: Snippet } = $props();
</script>

<fieldset class={className} style="border: none">
  {@render children?.()}
</fieldset>

<!-- @component
Wraps an option story in a borderless `fieldset` carrying the group classes,
so a single option renders as it would inside its choice group.
-->
