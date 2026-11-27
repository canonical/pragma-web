<script lang="ts">
  import type { Component } from "svelte";

  // Renders any component with its value bound to local state, and prints the
  // state, so a test can drive the control and read the bound value.
  let {
    of: Bound,
    binding = "value",
    value = $bindable(),
    ...rest
  }: {
    // biome-ignore lint/suspicious/noExplicitAny: the harness binds any component
    of: Component<any>;
    binding?: "value" | "checked" | "files";
    value?: unknown;
    [key: string]: unknown;
  } = $props();
</script>

{#if binding === "checked"}
  <Bound {...rest} bind:checked={value} />
{:else if binding === "files"}
  <Bound {...rest} bind:files={value} />
{:else}
  <Bound {...rest} bind:value />
{/if}
<output data-testid="bound">{JSON.stringify(value === undefined ? null : value)}</output>
