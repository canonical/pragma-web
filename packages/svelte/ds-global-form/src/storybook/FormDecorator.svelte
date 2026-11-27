<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";
  import { Form } from "../lib/pattern/Form/index.js";
  import createFormState from "../lib/utils/owner/createFormState.svelte.js";

  let {
    class: className,
    children,
  }: { class?: ClassValue; children?: Snippet } = $props();

  const owner = createFormState();
</script>

<Form class={className} {owner} onsubmit={(event) => event.preventDefault()}>
  {@render children?.()}
</Form>

<!-- @component
Wraps a story in a Form with its own owner, so a field sits in the form
subgrid and keeps its value in the owner by name.
-->
