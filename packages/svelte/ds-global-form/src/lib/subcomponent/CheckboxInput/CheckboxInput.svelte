<script lang="ts">
  import type { CheckboxInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-checkbox";

  let {
    id,
    class: className,
    style,
    checked = $bindable(),
    ...rest
  }: CheckboxInputProps = $props();
</script>

<input {id} {style} class={[componentCssClassName, className]} bind:checked {...rest} type="checkbox" />

<!-- @component
Presentational checkbox. Bind `checked` for two-way binding.

`import { CheckboxInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.checkbox_input
-->
