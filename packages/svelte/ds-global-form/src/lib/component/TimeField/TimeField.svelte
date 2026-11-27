<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { TimeInput } from "../../subcomponent/TimeInput/index.js";
  import type { TimeFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: TimeFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<TimeInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
Time input wrapped with field chrome (label, description, error) and conditional display.

`import { TimeField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.time_field
-->
