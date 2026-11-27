<script lang="ts">
  import type { FieldProps } from "../lib/pattern/Field/types.js";
  import { Field, Form } from "../lib/pattern/index.js";
  import type { FormOwner } from "../lib/utils/owner/types.js";
  import Bound from "./Bound.fixtures.svelte";

  // Renders fields in a Form with the given owner. The `bound` field binds its
  // value to local state instead, printed for the test to read.
  let {
    owner,
    fields,
    bound,
    value = $bindable(),
  }: {
    owner?: FormOwner;
    fields: FieldProps[];
    bound?: FieldProps;
    value?: unknown;
  } = $props();
</script>

<Form {owner} onsubmit={(event) => event.preventDefault()}>
  {#each fields as field (field.name)}<Field {...field} />{/each}
  {#if bound}<Bound of={Field} {...bound} bind:value />{/if}
</Form>
