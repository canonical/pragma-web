<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { DateInput } from "../../subcomponent/DateInput/index.js";
  import type { DateFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: DateFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<DateInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
Date input wrapped with field chrome. Its `min`/`max` constrain the picker and the native validity of the value.

`import { DateField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.date_field
-->
