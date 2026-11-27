<script lang="ts">
  import type { CustomControlProps } from "../lib/pattern/Field/types.js";

  let { name, value = $bindable() }: CustomControlProps<number> = $props();

  const rating = $derived(value ?? 0);
</script>

<fieldset>
  <legend>Rating</legend>
  {#each [1, 2, 3, 4, 5] as star (star)}
    <button
      type="button"
      aria-label={`${star} star${star > 1 ? "s" : ""}`}
      aria-pressed={rating >= star}
      onclick={() => (value = star)}
      style:background="none"
      style:border="none"
      style:cursor="pointer"
      style:font-size="1.25rem"
      style:color={rating >= star ? "#f5a623" : "#ccc"}
    >
      ★
    </button>
  {/each}
  <input type="hidden" {name} value={rating || ""} />
</fieldset>

<!-- @component
A five-star rating control for the custom `Field` story. It owns its accessible
label: each star button sets the bindable `value`, and a hidden input submits
it under `name`.
-->
