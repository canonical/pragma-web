<script lang="ts">
  import { Field } from "../lib/pattern/Field/index.js";
  import type { FieldProps } from "../lib/pattern/Field/types.js";

  // Renders fields in a plain form (no owner) with a reset button, so a test
  // can drive native validation; `isInForm: false` renders them bare.
  let {
    fields,
    isInForm = true,
    onsubmit,
  }: {
    fields: FieldProps[];
    isInForm?: boolean;
    onsubmit?: (event: SubmitEvent) => void;
  } = $props();
</script>

{#snippet content()}{#each fields as field (field.name)}<Field
      {...field}
    />{/each}{/snippet}

{#if isInForm}<form
    onsubmit={(event) => {
      event.preventDefault();
      onsubmit?.(event);
    }}
    >{@render content()}<button type="submit">Send</button><button type="reset">Reset</button></form
  >{:else}{@render content()}{/if}
