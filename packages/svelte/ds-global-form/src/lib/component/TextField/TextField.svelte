<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { TextInput } from "../../subcomponent/TextInput/index.js";
  import type { TextFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: TextFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<TextInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
TextInput wrapped with field chrome (label, description, error) and conditional display.

`import { TextField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.text_field
-->
