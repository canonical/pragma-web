<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { PhoneInput } from "../../subcomponent/PhoneInput/index.js";
  import type { PhoneFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: PhoneFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}{@const { required: _required, ...numberProps } = controlProps}<PhoneInput {...control} {...numberProps} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
PhoneInput wrapped with field chrome. The single composite value (an E.164
string or a structured object) is decomposed into a country and a number by the
input. Bind `value` for two-way binding. The number input carries the field's
ARIA wiring, with `aria-required` but not native `required`, as in React.

`import { PhoneField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.phone_field
-->
