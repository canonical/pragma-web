<script lang="ts">
  import { NumberInput } from "../../../../subcomponent/NumberInput/index.js";
  import clampToSlider from "./clampToSlider.js";
  import type { RangeControlProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds range-control";

  let {
    id,
    class: className,
    style,
    min,
    max,
    step,
    sliderLabel,
    value = $bindable(),
    ...numberProps
  }: RangeControlProps = $props();

  // The slider is client-only: without JavaScript only the working number
  // input is shown, never a slider that cannot stay in sync.
  let mounted = $state(false);
  // Marks the component mounted once it runs in the browser.
  $effect(() => {
    mounted = true;
  });

  const sliderValue = $derived(clampToSlider(value, min, max));
  const resolvedSliderLabel = $derived(
    sliderLabel ?? `${numberProps.name} (slider)`,
  );
</script>

<!--
  The number input is canonical: it carries the field name and ID, is the
  target of the field label, and submits without JavaScript. The slider is an
  enhancement with its own accessible name and no `name`, so it never submits.
--><div {style} class={[componentCssClassName, className]}><NumberInput {...numberProps} {id} class="range-number" {min} {max} {step} bind:value />{#if mounted}<input
      type="range"
      class="ds range range-slider"
      aria-label={resolvedSliderLabel}
      {min}
      {max}
      {step}
      value={sliderValue}
      disabled={numberProps.disabled}
      oninput={(event) => (value = event.currentTarget.valueAsNumber)}
    />{/if}</div>

<!-- @component
A canonical number input paired with a client-only slider that mirrors it. Bind
`value` for two-way binding.
-->
