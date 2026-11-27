<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { DateTimeInput } from "../../subcomponent/DateTimeInput/index.js";
  import type { DateTimeFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: DateTimeFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}
  descriptionPosition={chrome.descriptionPosition ?? "trailing"}>{#snippet children(controlProps)}<DateTimeInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
DateTime input wrapped with field chrome. Helper text (description) sits under the input by default.

`import { DateTimeField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.date_time_field
-->
