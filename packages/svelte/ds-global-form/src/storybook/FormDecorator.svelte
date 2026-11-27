<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { Form } from "../lib/pattern/Form/index.js";

  let {
    class: className,
    children,
  }: { class?: ClassValue; children?: Snippet } = $props();
</script>

<Form class={className} onsubmit={(event) => event.preventDefault()}>
  {@render children?.()}
</Form>

<!-- @component
Wraps a story in the Form shell, so a field sits in the form subgrid.
-->
