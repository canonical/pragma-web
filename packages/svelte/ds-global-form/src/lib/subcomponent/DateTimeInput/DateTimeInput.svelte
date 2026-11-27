<script lang="ts">
  import type { DateTimeInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input datetime chrome";

  let {
    id,
    class: className,
    style,
    min,
    max,
    step,
    value = $bindable(),
    ...rest
  }: DateTimeInputProps = $props();
</script>

<input {id} {style} {min} {max} {step} class={[componentCssClassName, className]} bind:value {...rest} type="datetime-local" />

<!-- @component
Presentational native datetime-local input. The visible format and clock follow
the user's locale and cannot be forced; the value is always ISO
`yyyy-mm-ddTHH:mm`. Bind `value` for two-way binding.

`import { DateTimeInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.date_time_input
-->
