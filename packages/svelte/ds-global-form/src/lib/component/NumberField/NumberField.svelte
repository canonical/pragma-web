<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { NumberInput } from "../../subcomponent/NumberInput/index.js";
  import type { NumberFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: NumberFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<NumberInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
NumberInput wrapped with field chrome. Collects a numeric value with optional min/max/step and prefix/suffix units; the value is `null` while empty.

`import { NumberField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.number_field
-->
