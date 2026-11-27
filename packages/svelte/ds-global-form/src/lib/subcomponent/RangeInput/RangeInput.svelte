<script lang="ts">
  import type { RangeInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds range";

  let {
    id,
    class: className,
    style,
    min,
    max,
    value = $bindable(),
    ...rest
  }: RangeInputProps = $props();
</script>

<input
  {id}
  type="range"
  class={[componentCssClassName, className]}
  {style}
  aria-valuemin={min}
  aria-valuemax={max}
  {min}
  {max}
  bind:value
  {...rest}
/><output for={id} class="ds range-output p">{value}</output>

<!-- @component
Presentational range input with a live value `<output>`. Bind `value` for
two-way binding.

`import { RangeInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.range_input
-->
