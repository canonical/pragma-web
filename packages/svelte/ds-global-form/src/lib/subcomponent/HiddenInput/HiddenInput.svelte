<script lang="ts">
  import type { HiddenInputProps } from "./types.js";

  const componentCssClassName = "ds form-hidden";

  let {
    id,
    class: className,
    style,
    value = $bindable(),
    ...rest
  }: HiddenInputProps = $props();
</script>

<input {id} {style} class={[componentCssClassName, className]} bind:value {...rest} type="hidden" />

<!-- @component
Presentational hidden input.

`import { HiddenInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.hidden_input
-->
