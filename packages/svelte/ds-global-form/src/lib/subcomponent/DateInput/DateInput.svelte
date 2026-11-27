<script lang="ts">
  import type { DateInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input date chrome";

  let {
    id,
    class: className,
    style,
    min,
    max,
    value = $bindable(),
    ...rest
  }: DateInputProps = $props();
</script>

<input {id} {style} {min} {max} class={[componentCssClassName, className]} bind:value {...rest} type="date" />

<!-- @component
Presentational native date input. The visible format follows the user's locale
and cannot be forced; the value is always ISO `yyyy-mm-dd`. Bind `value` for
two-way binding.

`import { DateInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.date_input
-->
