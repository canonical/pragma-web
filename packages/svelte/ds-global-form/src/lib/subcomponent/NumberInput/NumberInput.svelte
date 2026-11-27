<script lang="ts">
  import Adornment from "../../common/Adornment/Adornment.svelte";
  import type { NumberInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input number chrome";

  let {
    id,
    class: className,
    style,
    prefix,
    suffix,
    value = $bindable(),
    ...rest
  }: NumberInputProps = $props();
</script>

<div {style} class={[componentCssClassName, className]}>{#if prefix}<span class="prefix p"><Adornment content={prefix} /></span>{/if}<!-- `id` goes on the input so the field label targets a labelable element;
       `type` is last so a spread cannot override it. --><input {id} class="p" bind:value {...rest} type="number" />{#if suffix}<span class="suffix p"><Adornment content={suffix} /></span>{/if}</div>

<!-- @component
Presentational number input with optional prefix and suffix units. Bind
`value` for two-way binding; it is `null` while the input is empty.

`import { NumberInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.number_input
-->
