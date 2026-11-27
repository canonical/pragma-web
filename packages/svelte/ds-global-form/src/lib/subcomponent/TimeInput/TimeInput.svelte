<script lang="ts">
  import type { TimeInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input time chrome";

  let {
    id,
    class: className,
    style,
    min,
    max,
    step,
    value = $bindable(),
    ...rest
  }: TimeInputProps = $props();
</script>

<input {id} {style} {min} {max} {step} class={[componentCssClassName, className]} bind:value {...rest} type="time" />

<!-- @component
Presentational native time input. Whether the clock shows 12 or 24 hours follows
the user's locale and cannot be forced; the value is always 24-hour `HH:mm`.
Bind `value` for two-way binding.

`import { TimeInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.time_input
-->
