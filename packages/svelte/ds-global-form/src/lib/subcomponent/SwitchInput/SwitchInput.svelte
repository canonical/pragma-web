<script lang="ts">
  import type { SwitchInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-switch";

  let {
    id,
    class: className,
    style,
    checked = $bindable(),
    ...rest
  }: SwitchInputProps = $props();
</script>

<!-- `type` and `role` follow the spread, so they cannot be overridden. A native
     checkbox exposes its checked state, so role="switch" needs no aria-checked. --><input {id} {style} class={[componentCssClassName, className]} bind:checked {...rest} type="checkbox" role="switch" />

<!-- @component
Presentational switch: a checkbox with `role="switch"`, styled as a sliding
toggle. Bind `checked` for two-way binding.

`import { SwitchInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.switch_input
-->
