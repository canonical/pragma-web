<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { SelectInput } from "../../subcomponent/SelectInput/index.js";
  import type { SelectFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: SelectFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<SelectInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
SelectInput wrapped with field chrome (label, description, error) and conditional display.

`import { SelectField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.select_field
-->
